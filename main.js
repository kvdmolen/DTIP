const { createApp, ref, onMounted, nextTick } = Vue

const App = {
  setup() {
    const htmlContent = ref('Loading...')
    const toc = ref([])

    const fetchMarkdown = async (url) => {
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch markdown')
      return response.text()
    }

    const extractText = (inline) => {
      // If string, return directly
      if (typeof inline === 'string') return inline
      // If object with text property (marked v5+ heading object)
      if (inline && typeof inline === 'object' && inline.text) {
        return inline.text
      }
      // If array of tokens
      if (Array.isArray(inline)) {
        return inline.map(t => t.text || t.raw || '').join('')
      }
      return String(inline)
    }

    const generateTOC = (tokens) => {
      return tokens
        .filter(t => t.type === 'heading' && t.depth <= 3)
        .map(h => {
          const txt = extractText(h.tokens || h.text)
          return {
            text: txt,
            level: h.depth,
            id: txt.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]/g, '')
          }
        })
    }

    onMounted(async () => {
      try {
        const markdown = await fetchMarkdown('DTIP.md')
        const tokens = marked.lexer(markdown, { gfm: true })
        toc.value = generateTOC(tokens)

        const renderer = new marked.Renderer()
        renderer.heading = ({ text, depth }) => {
          // marked v5+ passes an object with text and depth
          const txt = extractText(text)
          const id = txt.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]/g, '')
          return `<h${depth} id="${id}">${txt}</h${depth}>`
        }

        htmlContent.value = marked.parse(markdown, { renderer })

        // Apply syntax highlighting after DOM updates
        nextTick(() => {
          document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block)
          })
        })
      } catch (err) {
        htmlContent.value = 'Failed to load content'
        console.error(err)
      }
    })

    return { htmlContent, toc }
  },
  template: `
    <header class="site-header">
      <h1 class="site-title"><a href="#">DTIP</a></h1>
      <span class="site-subtitle">Decentralized Trust Interop Profile</span>
      <span class="version-badge">Draft v0.7</span>
    </header>
    <div class="main-container">
      <nav class="toc-sidebar">
        <h2 class="toc-title">Contents</h2>
        <ul class="toc-list">
          <li v-for="item in toc" :key="item.id" class="toc-item" :class="'toc-level-' + item.level">
            <a :href="'#' + item.id">{{ item.text }}</a>
          </li>
        </ul>
      </nav>
      <main class="content-area">
        <div class="content-wrapper">
          <article class="markdown-body" v-html="htmlContent"></article>
        </div>
      </main>
    </div>
  `
}

createApp(App).mount('#app')
