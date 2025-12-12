const { createApp, ref, onMounted, nextTick, defineComponent } = Vue

// Initialize Mermaid
mermaid.initialize({ startOnLoad: false, theme: 'neutral' })

// Page configuration
const pages = [
  { id: 'home', label: 'Home', file: 'pages/home.md' },
  // { id: 'guide', label: 'Guide', file: 'pages/guide.md' },
  { id: 'examples', label: 'Examples', file: 'pages/examples.md' }
]

// Template
const template = `
  <header class="site-header">
    <h1 class="site-title">
      <a href="#/home" @click.prevent="switchPage('home')">DTIP</a>
    </h1>
    <span class="site-subtitle">Decentralized Trust Interop Profile</span>
    <nav class="page-menu">
      <button
        v-for="page in pages"
        :key="page.id"
        :class="['page-menu-item', { active: currentPage === page.id }]"
        @click="switchPage(page.id)"
      >
        {{ page.label }}
      </button>
    </nav>
    <span class="version-badge">Draft v0.7</span>
  </header>

  <div class="main-container">
    <nav class="toc-sidebar">
      <h2 class="toc-title">Contents</h2>
      <ul class="toc-list">
        <li
          v-for="item in toc"
          :key="item.id"
          :class="['toc-item', 'toc-level-' + item.level]"
        >
          <a
            :href="'#/' + currentPage + '#' + item.id"
            @click.prevent="navigateToSection(item.id)"
          >
            {{ item.text }}
          </a>
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

// Utility functions
const fetchMarkdown = async (url) => {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Failed to fetch markdown')
  return response.text()
}

const extractText = (inline) => {
  if (typeof inline === 'string') return inline
  if (inline && typeof inline === 'object' && inline.text) return inline.text
  if (Array.isArray(inline)) return inline.map(t => t.text || t.raw || '').join('')
  return String(inline)
}

const generateSlug = (text) => {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]/g, '')
}

const generateTOC = (tokens) => {
  return tokens
    .filter(t => t.type === 'heading' && t.depth <= 3)
    .map(h => {
      const text = extractText(h.tokens || h.text)
      return {
        text,
        level: h.depth,
        id: generateSlug(text)
      }
    })
}

// URL hash utilities
const getPageFromHash = () => {
  const hash = window.location.hash
  if (hash.startsWith('#/')) {
    const pageId = hash.slice(2).split('#')[0]
    if (pages.some(p => p.id === pageId)) {
      return pageId
    }
  }
  return 'home'
}

const getSectionFromHash = () => {
  const hash = window.location.hash
  const match = hash.match(/#\/[^#]+#(.+)$/)
  return match ? match[1] : null
}

// App component
const App = defineComponent({
  name: 'App',

  setup() {
    const htmlContent = ref('Loading...')
    const toc = ref([])
    const currentPage = ref(getPageFromHash())

    const loadPage = async (pageId, sectionId = null) => {
      const page = pages.find(p => p.id === pageId)
      if (!page) return

      try {
        htmlContent.value = 'Loading...'
        const markdown = await fetchMarkdown(page.file)
        const tokens = marked.lexer(markdown, { gfm: true })
        toc.value = generateTOC(tokens)

        const renderer = new marked.Renderer()
        renderer.heading = ({ text, depth }) => {
          const txt = extractText(text)
          const id = generateSlug(txt)
          return `<h${depth} id="${id}">${txt}</h${depth}>`
        }

        htmlContent.value = marked.parse(markdown, { renderer })

        nextTick(async () => {
          // Render Mermaid diagrams
          document.querySelectorAll('pre code.language-mermaid').forEach((block) => {
            const pre = block.parentElement
            const div = document.createElement('div')
            div.className = 'mermaid'
            div.textContent = block.textContent
            pre.replaceWith(div)
          })
          await mermaid.run()

          // Syntax highlighting
          document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block)
          })

          // Scroll handling
          if (sectionId) {
            document.getElementById(sectionId)?.scrollIntoView()
          } else {
            window.scrollTo(0, 0)
          }
        })
      } catch (err) {
        htmlContent.value = 'Failed to load content'
        console.error(err)
      }
    }

    const switchPage = (pageId) => {
      if (currentPage.value === pageId) return
      currentPage.value = pageId
      window.history.pushState(null, '', `#/${pageId}`)
      loadPage(pageId)
    }

    const navigateToSection = (sectionId) => {
      window.history.pushState(null, '', `#/${currentPage.value}#${sectionId}`)
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
    }

    onMounted(() => {
      // Set initial hash if not present
      if (!window.location.hash.startsWith('#/')) {
        window.history.replaceState(null, '', `#/${currentPage.value}`)
      }

      loadPage(currentPage.value, getSectionFromHash())

      // Handle browser back/forward
      window.addEventListener('hashchange', () => {
        const pageId = getPageFromHash()
        const sectionId = getSectionFromHash()

        if (pageId !== currentPage.value) {
          currentPage.value = pageId
          loadPage(pageId, sectionId)
        } else if (sectionId) {
          document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
        }
      })
    })

    return {
      htmlContent,
      toc,
      pages,
      currentPage,
      switchPage,
      navigateToSection
    }
  },

  template
})

// Mount app
createApp(App).mount('#app')
