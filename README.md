# Hitbim-CLI (bimio)

Hitbim-CLI (bimio) is a powerful command line interface designed to streamline the development and distribution of Hitbim plugins and components.

## Overview

With Hitbim-CLI, developers can easily initialize projects, generate sample plugins and components, manage local development servers, and interact with the Hitbim services for registration, login, download, upload and more.

## Installation

Install Hitbim-CLI (bimio) globally with npm:

```
npm install -g hitbim-cli
```

## Usage

The CLI can be used with the command 'bimio'. Here's the command format:

```
bimio [command] [options]
```

## Getting Started

For the first time, initialize your project with the 'init' command:

```
bimio init [projectName]
```

Then you can create plugins or components for your project:

```
bimio create --plugin [pluginNames...]
bimio create --component [componentNames...]
```

To run your project locally, use the 'run' command:

```
bimio run --port [port]
```

## Command List

### init

```
bimio init <projectName>
```

Initialize a new project with the given project name. You must provide a project name.

### create

```
bimio create --plugin <pluginNames...>
bimio create --component <componentNames...>
bimio create --plugin <pluginNames...> --component <componentNames...>
```

Generate a standard structure following Hitbim's architecture. This command generates sample plugins or components for your project. You must select either plugin or component. If you want, you can generate both at the same time.

### run

```
bimio run --port <port>
```

Run your project to see the preview. The default port is 3000.

### stop

```
bimio stop
```

Stop your running project.

### signup

```
bimio signup
```

Redirect you to the signup page for Hitbim Services.

### login

```
bimio login --email <email> --password <password>
```

Login to Hitbim Services. Email and password are required. If you are already logged in, it will display your current session information.

### logout

```
bimio logout
```

Logout from Hitbim Services.

### session

```
bimio session
```

Check whether the user is logged in or not, and show the user's information.

### mylist

```
bimio mylist --plugin
bimio mylist --component
bimio mylist --all
```

Show your lists from Hitbim Services. You must select either plugin, component, or all.

### download

```
bimio download --plugin <pluginId>
bimio download --component <componentId>
```

Download from Hitbim Services. You must select either plugin or component.

### upload

```
bimio upload --plugin <pluginNames...>
bimio upload --component <componentNames...>
bimio upload --all
bimio upload --new
```

Upload to Hitbim Services. You must select either plugin, component, or all. If you want to upload as new, use the '--new' option.

### help

```
bimio help [commandName]
```

Display help information. If you specify a command.
