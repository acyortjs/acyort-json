const _ = require('lodash')

function json(data) {
  const { config } = this
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

  result.config = Object.assign(_.omit(config, ['token']), {
    posts: posts.map(post => post.id),
    pages: pages.map(page => _.pick(page, ['id', 'name'])),
    tags: Object.keys(tags).map(id => ({
      id,
      name: tags[id][0].name,
      count: tags[id].reduce((prev, item) => prev + item.posts.length, 0),
    })),
    categories: Object.keys(categories).map(id => ({
      id,
      name: categories[id][0].name,
      count: categories[id].reduce((prev, item) => prev + item.posts.length, 0),
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
    result.categorie[key] = category[key].map(page => ({
      id: page.id,
      title: page.title,
      posts: page.posts.map(id => getPostById(id)),
    }))
  })

  Object.keys(tag).forEach((key) => {
    result.tags[key] = tag[key].map(page => ({
      id: page.base.split('/').slice(-1),
      title: page.title,
      posts: page.posts.map(id => getPostById(id)),
    }))
  })

  console.log(result)
}

module.exports = json
