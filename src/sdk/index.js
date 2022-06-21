const req = require.context('./', true, /^(\.\/.+\/index.js)|(\.\/(?:(?!index\.).)+\.js)$/)
const requireAll = requireContext =>
  requireContext.keys().reduce((prev, cur) => {
    const module = requireContext(cur).default
    const key = ~cur.indexOf('index.js') ? cur.split('/')[1] : cur.split('/')[1].replace('.js', '')
    return { ...prev, [key]: module }
  }, {})

export default requireAll(req)
