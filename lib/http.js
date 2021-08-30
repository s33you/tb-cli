const axios = require("axios");

axios.interceptors.response.use((res) => {
  return res.data;
});

/**
 * 获取模板列表
 * @returns Promise
 */
async function getRepoList() {
  return axios.get("https://api.github.com/users/s33you/repos");
}

/**
 * 获取版本信息
 * @param {string} repo 模板名称
 * @returns Promise
 */
async function getTagList(repo) {
  return axios.get(`https://api.github.com/repos/s33you/${repo}/tags`);
}
/**
 * 获取分支信息
 * @param {string} repo 模板名称
 * @returns Promise
 */
async function getBranchList(repo) {
  return axios.get(`https://api.github.com/repos/s33you/${repo}/branches`);
}
module.exports = {
  getRepoList,
  getTagList,
  getBranchList
};
