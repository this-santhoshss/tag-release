import axios from 'axios';
import * as tl from 'azure-pipelines-task-lib/task';

import { log } from './logger';

import type { AuthMethod, TaskInputs } from './models/TaskInputs';
import type { ValidatedVariables } from './models/ValidatedVariables';

const API_VERSION = '7.1';

async function run() {
  try {
    // Get task inputs
    const inputs: TaskInputs = {
      tagName: tl.getInput('tagName', true)!,
      tagMessage: tl.getInput('tagMessage', false) || undefined,
      failOnExistingTag: tl.getBoolInput('failOnExistingTag', false),
      authMethod: tl.getInput('authMethod', true) as AuthMethod,
    };

    const collectionUri = tl.getVariable('System.TeamFoundationCollectionUri');
    const project = tl.getVariable('System.TeamProjectID');
    const repoId = tl.getVariable('Build.Repository.Id');
    const commitId = tl.getVariable('Build.SourceVersion');
    const accessToken = tl.getVariable('System.AccessToken');

    validateInputs(inputs);
    const vars = validateVariables(collectionUri, project, repoId, commitId, accessToken);

    log(`Starting tag creation process for: ${inputs.tagName}`);

    const tagAlreadyExists = await checkIfTagExists(
      vars.collectionUri,
      vars.projectName,
      vars.repoId,
      inputs.tagName,
      vars.accessToken,
    );

    log(`Tag '${inputs.tagName}' exists: ${tagAlreadyExists}`);

    if (tagAlreadyExists && inputs.failOnExistingTag) {
      log(`Failing because tag exists and failOnExistingTag=true`);
      throw new Error(
        `❌ Tag '${inputs.tagName}' already exists. Aborting task as per configuration.`,
      );
    }

    if (tagAlreadyExists) {
      log(`Tag '${inputs.tagName}' exists, will overwrite as per config.`, 'warning');
      tl.logIssue(
        tl.IssueType.Warning,
        `Tag '${inputs.tagName}' already exists. Overwriting it as per configuration.`,
      );
    }

    await creatGitTag(
      inputs.tagName,
      inputs.tagMessage,
      vars.collectionUri,
      vars.projectName,
      vars.repoId,
      vars.commitId,
      vars.accessToken,
    );

    tl.setResult(tl.TaskResult.Succeeded, `✅ Tag '${inputs.tagName}' created successfully.`);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    tl.setResult(tl.TaskResult.Failed, `❌ Unexpected error: ${errorMessage}`);
  }
}

function validateInputs(inputs: TaskInputs): void {
  // Validate tag name format
  const tagNameRegex = /^[a-zA-Z0-9._\-/]+$/;
  if (!tagNameRegex.test(inputs.tagName)) {
    throw new Error(
      'Tag name contains invalid characters. Use only letters, numbers, dots, hyphens, underscores, and forward slashes.',
    );
  }
}

function validateVariables(
  collectionUri: string | undefined,
  projectName: string | undefined,
  repoId: string | undefined,
  commitId: string | undefined,
  accessToken: string | undefined,
): ValidatedVariables {
  if (!collectionUri) {
    throw new Error('Collection URI is not defined. Ensure the task is run in a valid context.');
  }
  if (!projectName) {
    throw new Error('Project name is not defined. Ensure the task is run in a valid context.');
  }
  if (!repoId) {
    throw new Error('Repository ID is not defined. Ensure the task is run in a valid context.');
  }
  if (!commitId) {
    throw new Error('Commit ID is not defined. Ensure the task is run in a valid context.');
  }
  if (!accessToken) {
    throw new Error(
      'Access token is not defined. Ensure the task has access to System.AccessToken.',
    );
  }

  return {
    collectionUri,
    projectName,
    repoId,
    commitId,
    accessToken,
  };
}

async function checkIfTagExists(
  collectionUri: string,
  project: string,
  repoId: string,
  tagName: string,
  token: string,
): Promise<boolean> {
  const url = `${collectionUri}${project}/_apis/git/repositories/${repoId}/refs?filter=tags/${tagName}&api-version=${API_VERSION}`;

  log(`Checking if tag exists. GET ${url}`);

  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  log(JSON.stringify(response.data, null, 2));
  log(`API response status: ${response.status}`);

  if (response.status !== 200) {
    throw new Error(
      `Failed to check if tag exists. HTTP ${response.status}: ${JSON.stringify(response.data)}`,
    );
  }

  const refs = response.data.value || [];
  return refs.length > 0;
}

async function creatGitTag(
  tagName: string,
  tagMessage: string | undefined,
  collectionUri: string,
  project: string,
  repoId: string,
  commitId: string,
  accessToken: string,
): Promise<void> {
  const url = `${collectionUri}${project}/_apis/git/repositories/${repoId}/annotatedtags?api-version=${API_VERSION}`;
  log(`Creating annotated tag. POST ${url}
    Payload: ${JSON.stringify(
      {
        name: tagName,
        message: tagMessage,
        taggedObject: { objectId: commitId, objectType: 'commit' },
      },
      null,
      2,
    )}`);
  const response = await axios.post(
    url,
    {
      name: tagName,
      message: tagMessage,
      taggedObject: {
        objectId: commitId,
        objectType: 'commit',
      },
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    },
  );

  log(JSON.stringify(response.data, null, 2));
  log(`API response status: ${response.status}`);

  if (response.status === 201) {
    const tag = response.data;
    log(
      `✅ Tag '${tag.name}' created successfully.\nTagged commit: ${tag.taggedObject.objectId}\nCreated by: ${tag.taggedBy.name} (${tag.taggedBy.email})\nMessage: ${tag.message}`,
    );
  } else {
    throw new Error(
      `❌ Failed to create tag. HTTP ${response.status}: ${JSON.stringify(response.data)}`,
    );
  }
}

run();
