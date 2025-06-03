# Azure DevOps Annotated Git Tag Creator Task

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE.md)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/en/)
[![Azure DevOps Extension](https://img.shields.io/badge/Azure%20DevOps-Extension-blue)](https://marketplace.visualstudio.com/items?itemName=cntechy.tag-release-for-git)

This task automates the creation of annotated Git tags in an Azure Repos Git repository during your Azure DevOps pipeline runs.

## Features

- Checks if a tag already exists before creating it
- Supports configurable behavior to fail or overwrite existing tags
- Creates annotated tags pointing to a specific commit
- Uses Azure DevOps System.AccessToken for authentication
- Logs detailed information about the process for easy troubleshooting


## Prerequisites

Azure DevOps pipeline with permissions to read/write Git repositories

Ensure `Allow scripts to access OAuth token` is enabled in the pipeline settings to access System.AccessToken

## Inputs

| Input Name          | Required | Description                                   |
|---------------------|----------|-----------------------------------------------|
| `tagName`           | Yes      | Name of the Git tag to create (e.g., v1.0)  |
| `tagMessage`        | No       | Message for the annotated tag                 |
| `failOnExistingTag` | No       | Boolean, if true task fails when tag exists   |
| `authMethod`        | Yes      | Authentication method (currently uses `System.AccessToken`) |


## How It Works

1. **Input Validation** — validates tag name format and required pipeline variables  
2. **Check Tag Existence** — queries Azure DevOps Git refs API for existing tags matching `tagName`  
3. **Conditional Behavior** — fails or warns based on `failOnExistingTag` input  
4. **Create Annotated Tag** — posts to Azure DevOps annotatedtags API to create the tag pointing to the specified commit  
5. **Logs Output** — detailed logs throughout the process to trace execution and API responses  


## License
This project is licensed under the Apache License 2.0 - see the LICENSE file for details.
