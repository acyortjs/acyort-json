const path = require('path')
const assert = require('power-assert')
const Acyort = require('acyort')
const { defaults } = require('acyort-config')

const config = defaults

config.base = __dirname
config.cache =  true
config.scripts = ['builder.js']
config.scripts_dir = '/'
config.per_page = 2

const acyort = new Acyort(config)
const { fs } = acyort
const jsonPath = path.join(__dirname, 'json')

function getJson(file) {
  return require(path.join(jsonPath, file))
}

describe('json', () => {
  it('no set json', async function () {
    this.timeout(5000)

    fs.removeSync(jsonPath)
    await acyort.build()
    assert(fs.existsSync(jsonPath) === false)
  })

  it('json path', async function () {
    this.timeout(5000)

    fs.removeSync(jsonPath)
    config.json = { path: '_json' }
    await acyort.build()
    assert(fs.existsSync(jsonPath) === false)
    fs.removeSync(path.join(__dirname, '_json'))
  })

  it('json data', async function () {
    this.timeout(5000)

    config.json = true
    await acyort.build()

    const _config = getJson('config.json')
    assert(_config.posts.length === 8)
    assert(_config.pages.length === 2)
    assert(_config.tags.length === 11)
    assert(_config.categories.length === 3)

    const page = getJson('page/2.json')
    assert(page[1].id === 210285498)
    assert(page[1].tags.length === 4)

    const pages = getJson('pages/196350551.json')
    assert(pages.id === 196350551)
    assert(pages.url === '/aa/bb/cc/')

    const post = getJson('posts/126817142.json')
    assert(post.id === 126817142)
    assert(post.next.id === 71470122)
    assert(post.title === 'Mirror - 基于 issues 的博客工具')

    const tag = getJson('tags/534950261/2.json')
    assert(tag.id === 534950261)
    assert(tag.current === 2)
    assert(tag.posts.length === 1)

    const category = getJson('categories/2983644/2.json')
    assert(category.id === 2983644)
    assert(category.total === 3)
    assert(category.title === 'blog')
  })
})
