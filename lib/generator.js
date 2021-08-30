// lib/Generator.js

const { getRepoList, getTagList, getBranchList } = require("./http");
const ora = require("ora");
const inquirer = require("inquirer");
const util = require("util");
const path = require("path");
const downloadGitRepo = require("download-git-repo");

// 添加加载动画
async function wrapLoading(fn, message, ...args) {
  // 使用 ora 初始化，传入提示信息 message
  const spinner = ora(message);
  // 开始加载动画
  spinner.start();

  try {
    // 执行传入方法 fn
    const result = await fn(...args);
    // 状态为修改为成功
    spinner.succeed();
    return result;
  } catch (error) {
    // 状态为修改为失败
    spinner.fail("Request failed, refetch ...");
  }
}

class Generator {
  constructor(name, targetDir) {
    // 目录名称
    this.name = name;
    // 创建位置
    this.targetDir = targetDir;
    this.downloadGitRepo = util.promisify(downloadGitRepo);
  }
  // 下载远程模板
  // 1）拼接下载地址
  // 2）调用下载方法
  async download(repo, branch) {
    // 1）拼接下载地址
    const requestUrl = `s33you/${repo}${branch ? "#" + branch : ""}`;

    // 2）调用下载方法
    await wrapLoading(
      this.downloadGitRepo, // 远程下载方法
      "waiting download template", // 加载提示信息
      requestUrl, // 参数1: 下载地址
      path.resolve(process.cwd(), this.targetDir)
    ); // 参数2: 创建位置
  }

  // 获取用户选择的模板
  // 1）从远程拉取模板数据
  // 2）用户选择自己新下载的模板名称
  // 3）return 用户选择的名称

  async getRepo() {
    // 1）从远程拉取模板数据
    const repoList = await wrapLoading(getRepoList, "waiting fetch template");
    if (!repoList) return;

    // 过滤我们需要的模板名称
    const repos = repoList.map((item) => item.name);

    // 2）用户选择自己新下载的模板名称
    const { repo } = await inquirer.prompt({
      name: "repo",
      type: "list",
      choices: repos,
      message: "Please choose a template to create project",
    });

    // 3）return 用户选择的名称
    return repo;
  }
  async getTag(repo) {
    // 1）基于 repo 结果，远程拉取对应的 tag 列表
    const tags = await wrapLoading(getTagList, "waiting fetch tag", repo);
    if (!tags) return;

    // 过滤我们需要的 tag 名称
    const tagsList = tags.map((item) => item.name);

    // 2）用户选择自己需要下载的 tag
    const { tag } = await inquirer.prompt({
      name: "tag",
      type: "list",
      choices: tagsList,
      message: "Place choose a tag to create project",
    });

    // 3）return 用户选择的 tag
    return tag;
  }
  async getBranches(repo) {
    // 1）基于 repo 结果，远程拉取对应的 branches 列表
    const branches = await wrapLoading(getBranchList, "waiting fetch tag", repo);
    if (!branches) return;

    // 过滤我们需要的 tag 名称
    const branchList = branches.map((item) => item.name);

    // 2）用户选择自己需要下载的 tag
    const { branch } = await inquirer.prompt({
      name: "branch",
      type: "list",
      choices: branchList,
      message: "Place choose a tag to create project",
    });

    // 3）return 用户选择的 tag
    return branch;
  }
  // 核心创建逻辑
  // 1）获取模板名称
  // 2）获取 tag 名称
  // 3）下载模板到模板目录
  async create() {
    // 1）获取模板名称
    const repo = await this.getRepo();

    // 2) 获取 tag 名称
    const branch  = await this.getBranches(repo);
    await this.download(repo, branch);
    console.log("用户选择了，repo=" + repo + "，tag=" + branch);
  }
}
module.exports = Generator;
