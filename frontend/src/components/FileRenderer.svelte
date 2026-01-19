<script>
  import { tick } from "svelte";
  import { renderObsidianMarkdown } from "../lib/obsidian-renderer";

  let { fileName, fileContent, isFileOpened = $bindable() } = $props();

  function handleBack() {
    isFileOpened = false;
    document.getElementById("content").innerHTML = "";
  }

  function render() {
    renderObsidianMarkdown(fileContent, document.getElementById("content"));
  }

	$effect.pre(() => {
		tick().then(() => {
      render();
		});
	});
</script>

<div>
  <button onclick={() => handleBack()}>Go back</button>
  <h1>{fileName}</h1>
  <hr>
  <div id="content">Loading...</div>
</div>
