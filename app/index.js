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
	console.log("description enter")
	const from = ctx.params.from
	const to = ctx.params.to
	const descriptionPage = await Promise.all([
		readFile(path.resolve(__dirname, 'description.html'))
	])

	const fileTemplate = dot.template(descriptionPage)
	ctx.body = fileTemplate({ from: from, to: to })
	console.log("description end ")
}

async function generatePlugin(ctx) {
	const from = ctx.params.from
	const to = ctx.params.to
	const zip = new AdmZip()

	// for now, open content_script.js and manifest.json in here. I think it would make more sense for them to be constants in memory
	const [contentScriptFileBuffer, manifest] = await Promise.all([
		readFile(path.resolve(__dirname, 'content_script.js')),
		readFile(path.resolve(__dirname, 'manifest.json'))
	])

	const contentScriptFileTemplate = dot.template(contentScriptFileBuffer)
	const manifestTemplate = dot.template(manifest)

	zip.addFile('content_script.js', contentScriptFileTemplate({from: from, to: to}))
	zip.addFile('manifest.json', manifestTemplate({from: from, to: to}))

	ctx.response.attachment('plugin.zip')
	ctx.response.body = zip.toBuffer()

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