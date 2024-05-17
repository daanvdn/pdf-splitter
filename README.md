# PDF Splitter
Simple Desktop app to splt a PDF file. Built with Angular 16 and  Electron 25.
To bootstrap the project the [Angular-Electron](https://github.com/maximegris/angular-electron) project by Maxime Gris has been leveraged.
It is built using a combination of technologies including TypeScript, JavaScript, npm, Python, Angular, and Node.js.

## Platform
Currently, the app is only available for Windows. The app is built using Electron Builder and the installer is created for Windows.

## Features

- Split PDF files into multiple parts.
- View PDF files within the application.
- Navigate through the pages of the PDF.
- Select output directory for the split files.

## Project Structure

The project is structured into several parts:

- `src`: Contains the source code of the application.
- `app`: Contains the main Electron configuration and setup.
- `.github/workflows`: Contains the GitHub Actions workflow for building and releasing the application.

## Key Files

- `app/main.ts`: The main Electron file that starts the application.
- `src/app/app.component.ts`: The main Angular component.
- `src/app/app.service.ts`: The main service that handles the logic of the application.
- `src/app/pdfview`: Contains the component for viewing PDF files.
- `src/app/pdf-operations-view`: Contains the component for handling PDF operations like splitting.
- `src/app/home`: Contains the home component of the application.
- `src/app/core/services/electron`: Contains the service for handling Electron specific operations.
- `.github/workflows/release.yml`: The GitHub Actions workflow for building and releasing the application.

## Development

This project uses Angular for the frontend and Electron for the desktop application. It also uses a Python script for the backend operations like splitting the PDF.

To run the project locally, you need to have Node.js, npm, and Python installed on your machine. After cloning the repository, you can install the dependencies using npm:

```powershell
npm install
```
Then, you can start the application in development mode with:

```powershell
npm start
```

## Building

The project uses GitHub Actions for building and releasing the application. The workflow is defined in .github/workflows/release.yml. It builds the application for Windows using Electron Builder and PyInstaller to package the Python rest api as an exe.


## License
This project is licensed under the MIT License.