<div align="center">
<a href="">
    <img src="communiserver-logo.png" alt="Communiserver Logo" />
</a>

<br/>
<br/>

<div align="center">
    <a href="">Home Page</a> |
    <a href="">Documentation</a>
</div>
</div>

<br/>
<br/>

# What is Communiserver MVP 📚

Communiserver MVP is a platform designed to bridge the educational gap in refugee camps and host communities by facilitating the donation of educational materials. It connects donors with local businesses to distribute and fulfill these donations, creating a sustainable and mutually beneficial ecosystem.

## Table of Contents

- [Set-up ⚙️](#set-up)
  - [Prerequisites ](#prerequisites)
  - [Installation ](#installation)
    - [Step 1: Set Up Your Development Environment ](#step-1-set-up-your-development-environment)
    - [Step 2: Clone the Repository ](#step-2-clone-the-repository)
    - [Step 3: Open the Project in Your IDE](#step-3-open-the-project-in-your-ide)
    - [Step 4: Set Up Environment Variables ](#step-4-set-up-environment-variables)
    - [Step 5: Launch the Application ](#step-5-launch-the-application)
- [Architecture 🚀](#architecture-)
  - [Overview ](#overview-)
  - [Key Principles ](#key-principles)
  - [Project Structure ](#project-structure)
  - [Module Structure ](#module-structure)
  - [Example Folder Structure ](#example-folder-structure)
  - [Overview of Modules ](#overview-of-modules)
    - [Core Module [Common] ](#core-module-common)
    - [Gateway Module ](#gateway-module)
    - [Domain Modules ](#domain-modules)
      - [Events ](#events)
    - [CommuniserverApplication.kt ](#communiserverapplicationkt)
  - [Summary 📜](#summary)
- [Technologies Used](#technologies-used)
- [Configuration](#configuration)
- [Contributors](#contributors)
- [Developed by](#developed-by)

# Set-up

This project is built using NestJS. Follow the guide below to set up and run the application on your local machine.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (version 18 or later recommended)
- **npm**
- **Your preferred IDE** (e.g., Visual Studio Code)

## Installation 💾

### Step 1: Set Up Your Development Environment 🛠️

1. **Install Node.js:**

   - Download and install Node.js from [nodejs.org](https://nodejs.org/).

2. **Install npm**
   - npm is included with Node.js.

### Step 2: Clone the Repository 🌀

    git@gitlab.awesomity.rw:awesomity/alight/wekraft/api.git

### Step 3: Open the Project in Your IDE 🖥️

- Open your preferred IDE (e.g., Visual Studio Code).
- Navigate to the project directory and open it.

### Step 4: Set Up Environment Variables 📂

- Create a `.env` file in the root directory of the project using **.env.example**.
- Edit the environment variables.

### Step 5: Launch the Application 🚀

- Install dependencies:

  ```shell
  npm install
  ```

- Start the application:

  ```shell
  npm run start:dev
  ```

- The application will run on port `8000` by default. You can access the API at `http://localhost:8000`.

### [IMPORTANT] Generating migrations

To generate a migration you need to run

```bash
npm run typeorm:generate-migration --name=MigrationName
```

# Architecture 🚀

## Overview 📒

The Communiserver MVP project is structured into distinct modules to manage different aspects of the platform effectively. Each domain is encapsulated in its own module to promote separation of concerns and reduce inter-module dependencies.

### Key Principles

- **Modularity:** Each domain is isolated in its own module.
- **Loose Coupling:** Minimize dependencies between modules.
- **Encapsulation:** Hide internal details of modules, exposing only necessary interfaces.

### Project Structure

The project is organized into several modules, each representing a distinct domain. Below are the main components of the project structure.

### Module Structure

- **Core Module:** Contains core functionalities and shared utilities.
- **Domain Modules:** Separate modules for each domain (e.g., Users, Products, Donations).
- **Gateway Module:** Contains controllers for handling API requests.

### Example Folder Structure

    src
    ├── __shared__
    │   ├── enums
    │   ├── exception
    │   ├── decorators
    │   ├── model
    │   ├── response
    │   └── utils
    ├── gateway
    │   ├── controllers
    │   ├── config
    │   └── filters
    ├── auth
    └── main.ts

## Technologies Used

- **TypeScript:** The primary programming language.
- **NestJS:** The framework used to build the application.
- **TypeORM:** The ORM used for database interactions.
- **PostgreSQL:** The database used to store data.
- **Jest:** The testing framework.
- **Docker:** Containerization tool.

## Contributors

- **[Twist](https://gitlab.awesomity.rw/twist)**
- **[Pacifique](https://gitlab.awesomity.rw/pacifiqueL)**
- **[Brian](https://gitlab.awesomity.rw/brian)**

## Developed by [Awesomity Lab](https://awesomity.rw)
