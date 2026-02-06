<script>
  import { renderObsidianMarkdown } from "../lib/obsidian-renderer";

  let { fileName, fileContent, isFileOpened = $bindable() } = $props();

  let dispayedContent = $derived(renderObsidianMarkdown(fileContent));

  function handleGoBack() {
    isFileOpened = false;
    fileContent = "";
  }
</script>

<div>
  <button onclick={() => handleGoBack()}>Go back</button>
  <h1>{fileName}</h1>
  <hr />
  <div>{@html dispayedContent}</div>
  <hr />
  <button onclick={() => handleGoBack()}>Go back</button>
</div>
