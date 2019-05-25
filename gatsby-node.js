const each = require('lodash/each')
const Promise = require('bluebird')
const path = require('path')


module.paths.push(
  path.resolve('../','gatsby-theme-basic-blog')
)

exports.createPages = ({graphql, createContentDigest, actions})=>{
  const PostTemplate = require.resolve(
    path.resolve('src','templates')
  )
  const { createPage, createNodeField } = actions

  return new Promise((resolve, reject) => {
    resolve(
      graphql(
        `
          {            
            allFile(filter: { extension: { regex: "/md|js/" } }, limit: 1000) {
              edges {
                node {
                  id
                  name: sourceInstanceName
                  path: absolutePath
                  remark: childMarkdownRemark {
                    id
                    frontmatter {
                      layout
                      path
                    }
                  }
                }
              }
            }
          }
        `
      ).then(({ errors, data }) => {
        if (errors) {
          console.log(errors)
          reject(errors)
        }
        const items = data.allFile.edges
        const posts = items.filter(({node}) => /posts/.test(node.name))
        each(posts, ({node}) => {
          if (!node.remark) return

          const {path} = node.remark.frontmatter
          console.log(node.remark.frontmatter)

          path && createPage({
            path,
            component: PostTemplate,
          })
        })
      })
    )})
}

exports.onCreateNode = ({actions, node}) => {
  const {createNodeField} = actions
  console.log(node.internal.type)
  if (!node.remark) return

  const {path} = node.remark.frontmatter

  createNodeField({
    node: node,
    name: 'slug',
    value: path,
  })
}


exports.onCreateWebpackConfig = ({ actions }) => {
  const { setWebpackConfig } = actions
  setWebpackConfig({
    resolve: {
      alias: {
        components: path.resolve( 'src/components'),
        templates: path.resolve( 'src/templates'),
        scss: path.resolve( 'src/scss'),
        pages: path.resolve( 'src/pages'),
      },
    },
  })
}
