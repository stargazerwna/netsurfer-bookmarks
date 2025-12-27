# NetSurfer Bookmarks Landing Page

This directory contains a simple static landing page for the **NetSurfer Bookmarks** project.  The page is written in plain HTML and uses [Tailwind CSS](https://tailwindcss.com/) via a CDN to provide modern styles without any build tooling.

## Features

- **Modern design** – Utilises Tailwind’s utility classes to create a clean, responsive layout.
- **Project overview** – The page highlights the core value proposition, features, and the open‑source nature of NetSurfer Bookmarks.
- **Easy to host** – No build step or server side dependencies are required.  Host the `index.html` file anywhere static files can be served.

## Running Locally

1. Clone this repository or download the `netsurfer-bookmarks-landing` folder.
2. Open `index.html` in your browser.  Since the page links Tailwind from a CDN, no additional setup is required.

## Deploying with GitHub Pages

You can deploy this landing page using GitHub Pages.  Two common approaches are:

### 1. Deploy from the `/docs` folder on the `main` branch

1. Copy the contents of `netsurfer-bookmarks-landing` into a `docs` folder in your repository.
2. Commit and push the changes.
3. In your repository settings, navigate to **Pages**.
4. Select the `main` branch and set `/docs` as the source folder.
5. GitHub Pages will build and publish the site at `https://&lt;your-username&gt;.github.io/&lt;your-repo-name&gt;/`.

### 2. Deploy from a `gh-pages` branch

1. Create a new branch called `gh-pages`.
2. Add the contents of `netsurfer-bookmarks-landing` to the root of that branch.
3. Commit and push the branch.
4. In your repository settings under **Pages**, choose the `gh-pages` branch as the source.
5. GitHub will automatically publish the site.

For more details see the [GitHub Pages documentation](https://docs.github.com/pages/getting-started-with-github-pages/creating-a-github-pages-site).

## Licence

The landing page content is released under the same licence as the NetSurfer Bookmarks project (GPL‑compatible).  Feel free to adapt or modify it to suit your needs.