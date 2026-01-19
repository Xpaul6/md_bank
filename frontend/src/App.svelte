<script lang="ts">
  import FileRenderer from "./components/FileRenderer.svelte";

  function applyStyles() {
    if (!document.getElementById('katex-styles')) {
      const link = document.createElement('link');
      link.id = 'katex-styles';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css';
      document.head.appendChild(link);
    }

    if (!document.getElementById('hljs-styles')) {
      const link = document.createElement('link');
      link.id = 'hljs-styles';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/styles/default.min.css';
      document.head.appendChild(link);
    }
  } 

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
      const response = await fetch('/api/files');
      if (!response.ok) throw new Error("Files request error");
      const data = await response.json();
      filesList = data;
    } catch (err) {
      console.log(err);
    }
  }

  // applyStyles();
  getFiles();
</script>

<svelte:head>
  <title>MD Bank</title>
  <!-- <link rel="icon" type="image" href="/gnome.png" /> -->
</svelte:head>

<main class="m-15">
  {#if !isFileOpened}
    <h1>Select file</h1>
    <ul>
      {#each filesList as file}
        <li><button onclick={()=>{handleFileSelect(file.toString())}}>{file}</button></li> 
      {/each}
    </ul>
  {:else}
    <FileRenderer fileName={fileName} fileContent={fileContent} bind:isFileOpened={isFileOpened}/>
  {/if}
</main>
