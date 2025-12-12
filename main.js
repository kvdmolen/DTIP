const { createApp, ref, onMounted, nextTick, watch } = Vue

const App = {
  setup() {
    const htmlContent = ref('Loading...')
    const toc = ref([])

    // Hard-coded pages menu
    const pages = [
      { id: 'home', label: 'Home', file: 'pages/home.md' },
      // { id: 'guide', label: 'Guide', file: 'pages/guide.md' },
      { id: 'examples', label: 'Examples', file: 'pages/examples.md' }
    ]

    // Get page from URL hash (format: #/page-id or #/page-id#section)
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

    // Get section from URL hash (format: #/page-id#section)
    const getSectionFromHash = () => {
      const hash = window.location.hash
      const sectionMatch = hash.match(/#\/[^#]+#(.+)$/)
      return sectionMatch ? sectionMatch[1] : null
    }

    // Scroll to section
    const scrollToSection = (sectionId) => {
      if (!sectionId) return
      nextTick(() => {
        const el = document.getElementById(sectionId)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' })
        }
      })
    }

    const currentPage = ref(getPageFromHash())

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
          const id = txt.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]/g, '')
          return `<h${depth} id="${id}">${txt}</h${depth}>`
        }

        htmlContent.value = marked.parse(markdown, { renderer })

        // Apply syntax highlighting and handle scrolling after DOM updates
        nextTick(() => {
          document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block)
          })

          // Scroll to section if specified, otherwise scroll to top
          if (sectionId) {
            const el = document.getElementById(sectionId)
            if (el) {
              el.scrollIntoView()
            }
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

    // Navigate to section within current page
    const navigateToSection = (sectionId) => {
      window.history.pushState(null, '', `#/${currentPage.value}#${sectionId}`)
      const el = document.getElementById(sectionId)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }

    onMounted(() => {
      // Set initial hash if not present
      if (!window.location.hash.startsWith('#/')) {
        window.history.replaceState(null, '', `#/${currentPage.value}`)
      }
      const initialSection = getSectionFromHash()
      loadPage(currentPage.value, initialSection)

      // Handle browser back/forward
      window.addEventListener('hashchange', () => {
        const pageId = getPageFromHash()
        const sectionId = getSectionFromHash()

        if (pageId !== currentPage.value) {
          currentPage.value = pageId
          loadPage(pageId, sectionId)
        } else if (sectionId) {
          // Same page, just scroll to section
          const el = document.getElementById(sectionId)
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' })
          }
        }
      })
    })

    return { htmlContent, toc, pages, currentPage, switchPage, navigateToSection }
  },
  template: `
    <header class="site-header">
      <h1 class="site-title"><a href="#/home" @click.prevent="switchPage('home')">DTIP</a></h1>
      <span class="site-subtitle">Decentralized Trust Interop Profile</span>
      <nav class="page-menu">
        <button
          v-for="page in pages"
          :key="page.id"
          @click="switchPage(page.id)"
          :class="['page-menu-item', { active: currentPage === page.id }]"
        >{{ page.label }}</button>
      </nav>
      <span class="version-badge">Draft v0.7</span>
    </header>
    <div class="main-container">
      <nav class="toc-sidebar">
        <h2 class="toc-title">Contents</h2>
        <ul class="toc-list">
          <li v-for="item in toc" :key="item.id" class="toc-item" :class="'toc-level-' + item.level">
            <a :href="'#/' + currentPage + '#' + item.id" @click.prevent="navigateToSection(item.id)">{{ item.text }}</a>
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
