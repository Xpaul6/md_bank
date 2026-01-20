<script lang="ts">
  import FileRenderer from "./components/FileRenderer.svelte";

  let isFileOpened = $state<Boolean>(false);
  let filesList = $state<Array<String>>([]);
  let fileName = $state<string>("");
  let fileContent = $state<string>("");

  async function loadFile(filename: string) {
    try {
      const response = await fetch(`/api/read-file?fileName=${filename}`);
      if (!response.ok) throw new Error("Readfile request error");
      const data = await response.text();
      fileContent = data;
    } catch (err) {
      console.log(err);
    }
  }

  async function handleFileSelect(filename: string) {
    loadFile(filename).then(() => {
      fileName = filename;
      isFileOpened = true;
    });
  }

  async function getFiles() {
    try {
      const response = await fetch("/api/files");
      if (!response.ok) throw new Error("Files request error");
      const data = await response.json();
      filesList = data;
    } catch (err) {
      console.log(err);
    }
  }

  getFiles();
</script>

<svelte:head>
  <title>MD Bank</title>
  <link rel="icon" type="image" href="/paper.png" />
</svelte:head>

<main class="m-15">
  {#if !isFileOpened}
    <h1>Select file</h1>
    <ul>
      {#each filesList as file}
        <li>
          <button
            onclick={() => {
              handleFileSelect(file.toString());
            }}>{file}</button
          >
        </li>
      {/each}
    </ul>
  {:else}
    <FileRenderer {fileName} {fileContent} bind:isFileOpened />
  {/if}
</main>
