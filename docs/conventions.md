# DevRel Resource Conventions

This document outlines the conventions for structuring and documenting resources shared in this repository.

## Resource Folder Structure

Each resource should reside in a dedicated subfolder within the relevant software category folder. The naming convention for the resource folder should be descriptive and potentially include versioning or specific identifiers if applicable.

Example structure:

```
/{software_name}/
  ├── {resource_identifier_1}/
  │   ├── README.md
  │   └── resource_file_1.json
  │   └── ... other resource files or subfolders ...
  └── {resource_identifier_2}/
      ├── README.md
      └── ...
```

- `{software_name}`: The name of the software the resource relates to (e.g., `comfyui`, `stable-diffusion`).
- `{resource_identifier}`: A unique and descriptive name for the specific resource (e.g., `flux.1-dev-openai-gpt-image-1`, `basic-inpainting-workflow`).

## README.md Content

Each resource folder MUST contain a `README.md` file with the following information:

1.  **Title:** A clear and concise title for the resource (H1 heading).
2.  **Introduction:** A short sentence describing the associated content (e.g., video) and the technology stack used.
3.  **Video Preview:** An embedded video thumbnail (ideally stored locally within the resource folder) that links directly to the video content.
4.  **Horizontal Rule:** A separator (`---`) for visual clarity.
5.  **Usage:** Detailed instructions on how to use the included files (e.g., loading a workflow), potentially including multiple methods (drag & drop, menu).
6.  **Workflow Preview (Optional):** If applicable (e.g., for ComfyUI workflows), include a preview image of the workflow/setup (ideally stored locally).

### README.md Template

```markdown
# [Resource Title]

[Short introductory sentence about the video/content and tech stack.]

[![Video Thumbnail Alt Text](./path/to/local/thumbnail.jpg)]([Link to Video])

---

## Usage

[Detailed instructions on how to use the files. Be specific.]

[Example for ComfyUI Workflow:]

You can load the workflow in multiple ways:

- Drag & drop the `[workflow_filename.json]` workflow into your ComfyUI
- Use the menu:
  - `Workflow > Open`
  - Select the `[workflow_filename.json]` workflow
  - Click on "Open"

[Optional: Include Workflow Preview Image]
Then you should see a workflow like this:

![Workflow Preview](./path/to/local/workflow-preview.jpg)
```

Adhering to this structure ensures consistency and makes it easier for the community to find and utilize the resources we provide.
