<script lang="ts">
  import FileRenderer from "./components/FileRenderer.svelte";

  let isFileOpened = $state<Boolean>(false);
  let filesList = $state<Array<string>>([]);
  let fileName = $state<string>("");
  let fileContent = $state<string>("");

  async function loadFile(filename: string): Promise<void> {
    try {
      const response = await fetch(`/api/read-file?fileName=${filename}`);
      if (!response.ok) throw new Error("Readfile request error");
      const data: string = await response.text();
      fileContent = data;
    } catch (err) {
      console.log(err);
    }
  }

  async function handleFileSelect(filename: string): Promise<void> {
    try {
      await loadFile(filename);
      fileName = filename;
      isFileOpened = true;
    } catch (err) {
      console.log(err);
    }
  }

  async function getFiles(): Promise<void> {
    try {
      const response = await fetch("/api/files");
      if (!response.ok) throw new Error("Files request error");
      const data: Array<string> = await response.json();
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
      {:else}
        <p class="warning">No files found</p>
      {/each}
    </ul>
  {:else}
    <FileRenderer {fileName} {fileContent} bind:isFileOpened />
  {/if}
</main>
