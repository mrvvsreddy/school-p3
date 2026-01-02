
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const toAbsolute = (p) => path.resolve(__dirname, p)

const manifest = JSON.parse(
    fs.readFileSync(toAbsolute('dist/client/.vite/manifest.json'), 'utf-8'),
)
const template = fs.readFileSync(toAbsolute('dist/client/index.html'), 'utf-8')
const { render } = await import('./dist/server/entry-server.js')

// Determine routes to prerender
const routesToPrerender = [
    '/',
    '/about',
    '/admissions',
    '/academics',
    '/facilities',
    '/faculty',
    '/contact',
    '/privacy'
]

    ; (async () => {
        try {
            // pre-render each route...
            for (const url of routesToPrerender) {
                const helmetContext = {}

                const appHtml = render(url, helmetContext)
                const { helmet } = helmetContext

                const html = template
                    .replace(`<!--app-html-->`, appHtml)
                    .replace(`<!--app-head-->`, `
        ${helmet.title.toString()}
        ${helmet.meta.toString()}
        ${helmet.link.toString()}
        ${helmet.script.toString()}
      `)

                const filePath = `dist/client${url === '/' ? '/index.html' : `${url}/index.html`}`

                // Ensure directory exists
                const dir = path.dirname(filePath)
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true })
                }

                fs.writeFileSync(toAbsolute(filePath), html)
                console.log('pre-rendered:', filePath)
            }
        } catch (e) {
            console.error('Prerender error:', e)
            process.exit(1)
        }
    })()
