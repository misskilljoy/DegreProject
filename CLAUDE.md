# Degre Design

Static portfolio site for an interior design studio.

## Structure

- `index.html` - main landing page.
- `project.html` - shared project detail template.
- `styles/main.css` - all site styles.
- `scripts/project-data.js` - project metadata, covers, and galleries.
- `scripts/main.js` - navigation, animations, portfolio routing, and project rendering.
- `assets/images/site/` - shared site images.
- `assets/images/projects/<project-id>/` - project cover and project-specific gallery.

## Project Images

Project pages are rendered from `scripts/project-data.js`.

For City Park, place renders in:

```text
assets/images/projects/city-park/render-01.jpg
assets/images/projects/city-park/render-02.jpg
...
assets/images/projects/city-park/render-22.jpg
```

Each project folder should keep its cover as:

```text
assets/images/projects/<project-id>/cover.png
```

Each portfolio card must have a unique `data-project` value matching a key in `window.PROJECT_DATA`.

## Local Preview

Open `index.html` directly in a browser or run a static server from the project root:

```bash
npx live-server .
```

Then test:

- portfolio card click opens `project.html?project=<id>`;
- the project title, parameters, gallery, and related projects match the selected id;
- mobile layout has no horizontal overflow.
