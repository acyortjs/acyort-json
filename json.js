const _ = require('lodash')
const pathFn = require('path')

function jsonify(data) {
  const { config, logger, fs } = this
  const { json, public_dir: publicDir, base } = config

  if (json === undefined) {
    return data
  }

  const { path = 'json' } = json
  const {
    posts,
    pages,
    categories,
    tags,
    index,
    tag,
    category,
  } = data
  const result = { categories: {}, tags: {} }

  function getPostById(id) {
    let post = _.cloneDeep(posts).find(p => p.id === id)

    if (post) {
      post = _.omit(post, ['raw', 'content', 'path', 'url', 'prev', 'next'])
      post.category = _.pick(post.category, ['id', 'name'])
      post.tags = post.tags.map(t => _.pick(t, ['id', 'name']))
      return post
    }
    return ''
  }

  function output(jsonPath, jsonData) {
    fs.outputFileSync(pathFn.join(base, publicDir, path, jsonPath), JSON.stringify(jsonData))
    logger.success(jsonPath)
  }

  result.config = Object.assign(_.omit(config, ['token', 'base', 'cache']), {
    posts: posts.map(post => post.id),
    pages: pages.map(page => _.pick(page, ['id', 'url'])),
    tags: tags.map(item => ({
      id: item.id,
      name: item.name,
      count: item.posts.length,
    })),
    categories: categories.map(item => ({
      id: item.id,
      name: item.name,
      count: item.posts.length,
    })),
  })

  result.posts = posts.map((p) => {
    const post = _.omit(p, ['raw', 'excerpt', 'path', 'url'])
    post.prev = getPostById(post.prev)
    post.next = getPostById(post.next)
    post.category = _.pick(post.category, ['id', 'name'])
    post.tags = post.tags.map(t => _.pick(t, ['id', 'name']))
    return post
  })

  result.pages = pages.map(page => _.omit(page, ['path', 'url', 'raw']))

  result.index = index.map(page => page.posts.map(id => getPostById(id)))

  Object.keys(category).forEach((key) => {
    result.categories[key] = category[key].map(page => ({
      id: +page.base.split('/').slice(-1),
      title: page.title,
      current: page.current,
      total: page.total,
      posts: page.posts.map(id => getPostById(id)),
    }))
  })

  Object.keys(tag).forEach((key) => {
    result.tags[key] = tag[key].map(page => ({
      id: +page.base.split('/').slice(-1),
      title: page.title,
      current: page.current,
      total: page.total,
      posts: page.posts.map(id => getPostById(id)),
    }))
  })

  output('config.json', result.config)
  result.pages.forEach(p => output(`pages/${p.id}.json`, p))
  result.posts.forEach(p => output(`posts/${p.id}.json`, p))
  result.index.forEach((p, i) => output(`page/${i + 1}.json`, p))

  Object.keys(result.categories).forEach((c) => {
    const current = result.categories[c]
    const dir = `categories/${current[0].id}`
    current.forEach((p, i) => output(`${dir}/${i + 1}.json`, p))
  })
  Object.keys(result.tags).forEach((t) => {
    const current = result.tags[t]
    const dir = `tags/${current[0].id}`
    current.forEach((p, i) => output(`${dir}/${i + 1}.json`, p))
  })

  return data
}

module.exports = jsonify
