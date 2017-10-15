const router = require('koa-router')()
const Koa = require('koa')
const app = new Koa()
const port = 3000
const AdmZip = require('adm-zip')
const fs = require('fs')
const path = require('path')
const dot = require('dot')
dot.templateSettings.strip = false

router.get('/', home)
	.get('/:from/:to', description)
	.get('/api/:browser/:from/:to', generatePlugin)

app.use(router.routes())

async function home(ctx) {
	const indexPage = await Promise.all([
		readFile(path.resolve(__dirname, 'index.html'))
	])
	const indexTemplate = dot.template(indexPage)
	ctx.body = indexTemplate({})
}

async function description(ctx) {
	const from = ctx.params.from
	const to = ctx.params.to
	const descriptionPage = await Promise.all([
		readFile(path.resolve(__dirname, 'description.html'))
	])

	const fileTemplate = dot.template(descriptionPage)
	ctx.body = fileTemplate({ from: from, to: to })
}

async function generatePlugin(ctx) {
	const from = ctx.params.from
        const browser = ctx.params.browser
	const to = ctx.params.to
	const zip = new AdmZip()

        switch(browser) {
            case "chrome":
        	// for now, open content_script.js and manifest.json in here. I think it would make more sense for them to be constants in memory
	        const [chromeContentScriptFileBuffer, chromeManifest] = await Promise.all([
		    readFile(path.resolve(__dirname, 'chrome/content_script.js')),
		    readFile(path.resolve(__dirname, 'chrome/manifest.json'))
	        ])

	        const chromeContentScriptFileTemplate = dot.template(chromeContentScriptFileBuffer)
        	const chromeManifestTemplate = dot.template(chromeManifest)

	        zip.addFile('content_script.js', chromeContentScriptFileTemplate({from: from, to: to}))
	        zip.addFile('manifest.json', chromeManifestTemplate({from: from, to: to}))

	        ctx.response.attachment('plugin.zip')
	        ctx.response.body = zip.toBuffer()
                break;
            case "firefox":
                break;
            case "opera":
                break;
            default:
                break;

        }
}

app.listen(port)

function readFile(path, encoding = 'utf8') {
	return new Promise((resolve, reject) => {
		fs.readFile(path, encoding, (err, data) => {
			if (err) {
				return reject(err)
			}

			resolve(data)
		})
	})
}
