# vscode-markuplint

[Markuplint](https://markuplint.dev) for Visual Studio Code

## Extension Settings

-   `markuplint.enable`: Control whether markuplint is enabled for HTML files or not
-   `markuplint.debug`: Enable debug mode
-   `markuplint.defaultConfig`: It's the configuration specified if configuration files do not exist
-   `markuplint.showAccessibility`: Enable the feature that **popup Accessibility Object**
-   `markuplint.showAccessibility.ariaVersion`: Set `1.1` or `1.2` WAI-ARIA version; Default is `1.2`.

## Release Notes

### 3.0.0

-   Change: Support for **Markuplint** `v3.x`
-   Change: Add the feature that **popup Accessibility Object**

### 2.2.1

-   Fix: Mis-resolving a target path for Windows.

### 2.2.0

-   Change: Supports `Smarty` format. (Needs `@markuplint/smarty-parser`)
-   Fix: The evaluation stops if thrown an error

### 2.1.1

-   Fix: Did not run when changing a document

### 2.1.0

-   Fix: Crash when no-installed markuplint
-   Change: Default loading version `2.x`
-   Change: Add the setting `markuplint.defaultConfig`
-   Change: Add the setting `markuplint.debug`
-   Change: Make it possible to edit the setting per langages

### 2.0.3

-   Change: Output the `reason`.
-   Change: Supports the `info` severity.
-   Change: Improve debug logs.

### 2.0.2

-   Change: Improve to debounce the execution.

### 2.0.0

-   Change: Support for markuplint v2.x.

### 1.10.1

-   Fix: The schema path.

### 1.10.0

-   change: Support for `.astro` file and `@markuplint/astro-parser`
-   update: dependencies

### 1.9.2

-   Fix: The schema path.

### 1.9.1

-   Fix: The repository path.

### 1.9.0

-   update: Supported JSX Parser and JavaScript/TypeScript file.

### 1.8.0

-   update: Supported some new languages/templates.

### 1.7.0

-   update: Default [markuplint](https://github.com/markuplint/markuplint) version v1.0.0

### 1.6.0

-   update: Default [markuplint](https://github.com/markuplint/markuplint) version v1.0.0-alpha.57
-   change: Added default configuration

### 1.3.0

-   update: Default [markuplint](https://github.com/markuplint/markuplint) version v1.0.0-alpha.53
-   change: Added languages to support

### 1.2.0

-   update: Default [markuplint](https://github.com/markuplint/markuplint) version v1.0.0-alpha.45
-   change: Support for `.pug` file and `@markuplint/pug-parser`

### 1.1.0

-   update: Default [markuplint](https://github.com/markuplint/markuplint) version v1.0.0-alpha.19
-   change: Support for `.vue` file and `@markuplint/vue-parser`

### 1.0.0

-   update: Default [markuplint](https://github.com/markuplint/markuplint) version v1.0.0-alpha

### 0.8.0

-   change: Notify message when markuplint could not be found in the node_modules of the workspace.
-   change: Show version of markuplint to status bar.

### 0.7.0

-   change: Support for `.vue` file on Vue.js
-   update: Default [markuplint](https://github.com/YusukeHirao/markuplint) version [v0.21.0](https://github.com/YusukeHirao/markuplint/releases/tag/v0.21.0)

### 0.6.0

-   update: Default [markuplint](https://github.com/YusukeHirao/markuplint) version [v0.16.2](https://github.com/YusukeHirao/markuplint/releases/tag/v0.16.2)

### 0.5.1

-   bugfix: Fix importing module error.

### 0.5.0

-   change: Importing module [markuplint](https://github.com/YusukeHirao/markuplint) from node_modules on current working directory automatically
-   update: Default [markuplint](https://github.com/YusukeHirao/markuplint) version [v0.14.0](https://github.com/YusukeHirao/markuplint/releases/tag/v0.14.0)

### 0.4.0

-   update module [markuplint](https://github.com/YusukeHirao/markuplint) [v0.12.0](https://github.com/YusukeHirao/markuplint/releases/tag/v0.12.0)

### 0.3.0

-   update module [markuplint](https://github.com/YusukeHirao/markuplint) [v0.11.0-beta.2](https://github.com/YusukeHirao/markuplint/releases/tag/v0.11.0-beta.2)

### 0.2.0

-   update module [markuplint](https://github.com/YusukeHirao/markuplint) [v0.9.0](https://github.com/YusukeHirao/markuplint/releases/tag/v0.9.0)

### 0.1.1

-   update module [markuplint](https://github.com/YusukeHirao/markuplint) [v0.7.0](https://github.com/YusukeHirao/markuplint/releases/tag/v0.7.0)

### 0.1.0

Trial release
