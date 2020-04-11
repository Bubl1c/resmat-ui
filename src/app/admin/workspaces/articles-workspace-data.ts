import { ArticleDto } from "../components/article-editor/article-editor.component";
import { ApiService } from "../../api.service";
import { RMU } from "../../utils/utils";
import { GoogleAnalyticsUtils } from "../../utils/GoogleAnalyticsUtils";
import { AdminComponent } from "../admin.component";
import { WorkspaceData, WorkspaceDataTypes } from "./workspace-data";

export class ArticlesWorkspaceData extends WorkspaceData {
  type = WorkspaceDataTypes.articles;

  showArticles = true;
  articleToEdit: ArticleDto;
  articleToShow: ArticleDto;
  newArticleHeader: string = '';

  constructor(public data: ArticleDto[], private api: ApiService, private adminComponent: AdminComponent) {
    super();
    RMU.safe(() => {
      GoogleAnalyticsUtils.pageView(`/admin/articles`, `Адмінка :: Статті`)
    });
  }

  createNewArticle() {
    this.api.post('/articles', {
      id: -1,
      header: this.newArticleHeader,
      preview: '',
      body: '',
      visible: false,
      meta: {
        uploadedFileUrls: []
      }
    }).subscribe({
      next: (savedArticle: ArticleDto) => {
        this.data.unshift(savedArticle);
        this.articleToEdit = savedArticle;
        RMU.safe(() => {
          GoogleAnalyticsUtils.event("Admin", `Created article ${savedArticle.id} "${savedArticle.header}"`, "CreateArticle", savedArticle.id)
        });
      },
      error: (e) => alert(JSON.stringify(e)),
      complete: () => this.newArticleHeader = undefined,
    });
  }
  show(article: ArticleDto) {
    this.showArticles = false;
    this.articleToShow = article;
    RMU.safe(() => {
      GoogleAnalyticsUtils.pageView(`/admin/articles/${article.id}/view`, `Адмінка :: Перегляд статті "${article.header}"`)
    });
  }
  edit(article: ArticleDto) {
    this.showArticles = false;
    this.articleToEdit = article;
    RMU.safe(() => {
      GoogleAnalyticsUtils.pageView(`/admin/articles/${article.id}/edit`, `Адмінка :: Редагування статті "${article.header}"`)
    });
  }
  saveEdited(article: ArticleDto) {
    const toSend = JSON.parse(JSON.stringify(article));
    this.api.put(`/articles/${article.id}`, toSend).subscribe({
      next: (savedArticle: ArticleDto) => {
        for(let i = 0; i < this.data.length; i++) {
          if(this.data[i].id === savedArticle.id) {
            this.data[i] = savedArticle;
            break;
          }
        }
        RMU.safe(() => {
          GoogleAnalyticsUtils.event("Admin", `Edited article ${savedArticle.id}`, "EditArticle", savedArticle.id);
        });
        alert("Збережено успішно")
      },
      error: (e) => alert(JSON.stringify(e))
    });
  }
  deleteArticle(article: ArticleDto) {
    if(window.confirm("Ви дійсно хочете видалити статтю '" + article.header + "' ?")) {
      this.api.delete(`/articles/${article.id}`).subscribe({
        next: () => {
          const index = this.data.indexOf(article);
          RMU.safe(() => {
            GoogleAnalyticsUtils.event("Admin", `Deleted article ${article.id} "${article.header}"`, "DeleteArticle", article.id);
          });
          if(index === -1) {
            alert("Щось не так з видаленням матеріалу, не найдено у списку")
          } else {
            alert("Видалено успішно");
            this.data.splice(index, 1)
          }
        },
        error: e => alert("Не вдалося видалити матеріал: " + JSON.stringify(e))
      })
    }
  }
  backToList() {
    this.showArticles = true;
    this.articleToShow = null;
    this.articleToEdit = null;
  }

}
