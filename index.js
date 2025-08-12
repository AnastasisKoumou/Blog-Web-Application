import express from "express";
import fs from "fs";

const app = express();
const port = 3000;

const DATA_FILE = "articles.json";

let articles = [];
let articleId = 1;

if (fs.existsSync(DATA_FILE)) {
  const fileData = fs.readFileSync(DATA_FILE, "utf-8");
  if (fileData.trim()) {
    articles = JSON.parse(fileData);
    
    articleId = articles.length ? Math.max(...articles.map(a => a.id)) + 1 : 1;
  }
}

function saveArticles() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(articles, null, 2), "utf-8");
}

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/create", (req, res) => {
  res.render("create");
});

app.post("/", (req, res) => {
  const { title, author, article } = req.body;
  const date = new Date().toLocaleString();

  articles.push({
    id: articleId++,
    title,
    author,
    article,
    date
  });

  saveArticles(); 
  res.redirect("/view?success=true");
});

app.get("/view", (req, res) => {
  const success = req.query.success === "true";
  res.render("view", { articles, success });
});

app.get("/edit", (req, res) => {
  const success = req.query.success === "true";
  res.render("edit", { articles, success });
});

app.get("/edit/:id", (req, res) => {
  const articleId = parseInt(req.params.id);
  const article = articles.find(a => a.id === articleId);
  if (!article) return res.status(404).send("Article not found");
  res.render("update", { article });
});

app.post("/update/:id", (req, res) => {
  const articleId = parseInt(req.params.id);
  const article = articles.find(a => a.id === articleId);

  if (!article) {
    return res.status(404).send("Article not found");
  }

  article.title = req.body.title;
  article.author = req.body.author;
  article.article = req.body.article;
  article.date = new Date().toLocaleString();

  saveArticles();
  res.redirect("/edit?success=true");
});

app.post("/delete/:id", (req, res) => {
  const articleId = parseInt(req.params.id);
  const index = articles.findIndex(a => a.id === articleId);

  if (index !== -1) {
    articles.splice(index, 1);
    saveArticles();
  }

  res.redirect("/edit?success=true");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
