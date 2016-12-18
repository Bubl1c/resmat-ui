import { ResmatUiPage } from './app.po';

describe('resmat-ui App', function() {
  let page: ResmatUiPage;

  beforeEach(() => {
    page = new ResmatUiPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
