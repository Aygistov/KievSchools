'use strict'; // necessary for es6 output in node

import { browser, element, by, ElementFinder, ElementArrayFinder } from 'protractor';
import { promise } from 'selenium-webdriver';

const expectedH1 = 'Tour of Schools';
const expectedTitle = `${expectedH1}`;
const targetSchool = { id: 15, name: 'Magneta' };
const targetSchoolDashboardIndex = 3;
const nameSuffix = 'X';
const newSchoolName = targetSchool.name + nameSuffix;

class School {
  id: number;
  name: string;

  // Factory methods

  // School from string formatted as '<id> <name>'.
  static fromString(s: string): School {
    return {
      id: +s.substr(0, s.indexOf(' ')),
      name: s.substr(s.indexOf(' ') + 1),
    };
  }

  // School from school list <li> element.
  static async fromLi(li: ElementFinder): Promise<School> {
      let stringsFromA = await li.all(by.css('a')).getText();
      let strings = stringsFromA[0].split(' ');
      return { id: +strings[0], name: strings[1] };
  }

  // School id and name from the given detail element.
  static async fromDetail(detail: ElementFinder): Promise<School> {
    // Get school id from the first <div>
    let _id = await detail.all(by.css('div')).first().getText();
    // Get name from the h2
    let _name = await detail.element(by.css('h2')).getText();
    return {
        id: +_id.substr(_id.indexOf(' ') + 1),
        name: _name.substr(0, _name.lastIndexOf(' '))
    };
  }
}

describe('Tutorial part 6', () => {

  beforeAll(() => browser.get(''));

  function getPageElts() {
    let navElts = element.all(by.css('app-root nav a'));

    return {
      navElts: navElts,

      appDashboardHref: navElts.get(0),
      appDashboard: element(by.css('app-root app-dashboard')),
      topSchools: element.all(by.css('app-root app-dashboard > div h4')),

      appSchoolsHref: navElts.get(1),
      appSchools: element(by.css('app-root app-schools')),
      allSchools: element.all(by.css('app-root app-schools li')),
      selectedSchoolSubview: element(by.css('app-root app-schools > div:last-child')),

      schoolDetail: element(by.css('app-root app-school-detail > div')),

      searchBox: element(by.css('#search-box')),
      searchResults: element.all(by.css('.search-result li'))
    };
  }

  describe('Initial page', () => {

    it(`has title '${expectedTitle}'`, () => {
      expect(browser.getTitle()).toEqual(expectedTitle);
    });

    it(`has h1 '${expectedH1}'`, () => {
        expectHeading(1, expectedH1);
    });

    const expectedViewNames = ['Dashboard', 'Schools'];
    it(`has views ${expectedViewNames}`, () => {
      let viewNames = getPageElts().navElts.map((el: ElementFinder) => el.getText());
      expect(viewNames).toEqual(expectedViewNames);
    });

    it('has dashboard as the active view', () => {
      let page = getPageElts();
      expect(page.appDashboard.isPresent()).toBeTruthy();
    });

  });

  describe('Dashboard tests', () => {

    beforeAll(() => browser.get(''));

    it('has top schools', () => {
      let page = getPageElts();
      expect(page.topSchools.count()).toEqual(4);
    });

    it(`selects and routes to ${targetSchool.name} details`, dashboardSelectTargetSchool);

    it(`updates school name (${newSchoolName}) in details view`, updateSchoolNameInDetailView);

    it(`cancels and shows ${targetSchool.name} in Dashboard`, () => {
      element(by.buttonText('go back')).click();
      browser.waitForAngular(); // seems necessary to gets tests to pass for toh-pt6

      let targetSchoolElt = getPageElts().topSchools.get(targetSchoolDashboardIndex);
      expect(targetSchoolElt.getText()).toEqual(targetSchool.name);
    });

    it(`selects and routes to ${targetSchool.name} details`, dashboardSelectTargetSchool);

    it(`updates school name (${newSchoolName}) in details view`, updateSchoolNameInDetailView);

    it(`saves and shows ${newSchoolName} in Dashboard`, () => {
      element(by.buttonText('save')).click();
      browser.waitForAngular(); // seems necessary to gets tests to pass for toh-pt6

      let targetSchoolElt = getPageElts().topSchools.get(targetSchoolDashboardIndex);
      expect(targetSchoolElt.getText()).toEqual(newSchoolName);
    });

  });

  describe('Schools tests', () => {

    beforeAll(() => browser.get(''));

    it('can switch to Schools view', () => {
      getPageElts().appSchoolsHref.click();
      let page = getPageElts();
      expect(page.appSchools.isPresent()).toBeTruthy();
      expect(page.allSchools.count()).toEqual(10, 'number of schools');
    });

    it('can route to school details', async () => {
      getSchoolLiEltById(targetSchool.id).click();

      let page = getPageElts();
      expect(page.schoolDetail.isPresent()).toBeTruthy('shows school detail');
      let school = await School.fromDetail(page.schoolDetail);
      expect(school.id).toEqual(targetSchool.id);
      expect(school.name).toEqual(targetSchool.name.toUpperCase());
    });

    it(`updates school name (${newSchoolName}) in details view`, updateSchoolNameInDetailView);

    it(`shows ${newSchoolName} in Schools list`, () => {
      element(by.buttonText('save')).click();
      browser.waitForAngular();
      let expectedText = `${targetSchool.id} ${newSchoolName}`;
      expect(getSchoolAEltById(targetSchool.id).getText()).toEqual(expectedText);
    });

    it(`deletes ${newSchoolName} from Schools list`, async () => {
      const schoolsBefore = await toSchoolArray(getPageElts().allSchools);
      const li = getSchoolLiEltById(targetSchool.id);
      li.element(by.buttonText('x')).click();

      const page = getPageElts();
      expect(page.appSchools.isPresent()).toBeTruthy();
      expect(page.allSchools.count()).toEqual(9, 'number of schools');
      const schoolsAfter = await toSchoolArray(page.allSchools);
      // console.log(await School.fromLi(page.allSchools[0]));
      const expectedSchools =  schoolsBefore.filter(h => h.name !== newSchoolName);
      expect(schoolsAfter).toEqual(expectedSchools);
      // expect(page.selectedSchoolSubview.isPresent()).toBeFalsy();
    });

    it(`adds back ${targetSchool.name}`, async () => {
      const newSchoolName = 'Alice';
      const schoolsBefore = await toSchoolArray(getPageElts().allSchools);
      const numSchools = schoolsBefore.length;

      element(by.css('input')).sendKeys(newSchoolName);
      element(by.buttonText('add')).click();

      let page = getPageElts();
      let schoolsAfter = await toSchoolArray(page.allSchools);
      expect(schoolsAfter.length).toEqual(numSchools + 1, 'number of schools');

      expect(schoolsAfter.slice(0, numSchools)).toEqual(schoolsBefore, 'Old schools are still there');

      const maxId = schoolsBefore[schoolsBefore.length - 1].id;
      expect(schoolsAfter[numSchools]).toEqual({id: maxId + 1, name: newSchoolName});
    });
  });

  describe('Progressive school search', () => {

    beforeAll(() => browser.get(''));

    it(`searches for 'Ma'`, async () => {
      getPageElts().searchBox.sendKeys('Ma');
      browser.sleep(1000);

      expect(getPageElts().searchResults.count()).toBe(4);
    });

    it(`continues search with 'g'`, async () => {
      getPageElts().searchBox.sendKeys('g');
      browser.sleep(1000);
      expect(getPageElts().searchResults.count()).toBe(2);
    });

    it(`continues search with 'e' and gets ${targetSchool.name}`, async () => {
      getPageElts().searchBox.sendKeys('n');
      browser.sleep(1000);
      let page = getPageElts();
      expect(page.searchResults.count()).toBe(1);
      let school = page.searchResults.get(0);
      expect(school.getText()).toEqual(targetSchool.name);
    });

    it(`navigates to ${targetSchool.name} details view`, async () => {
      let school = getPageElts().searchResults.get(0);
      expect(school.getText()).toEqual(targetSchool.name);
      school.click();

      let page = getPageElts();
      expect(page.schoolDetail.isPresent()).toBeTruthy('shows school detail');
      let school2 = await School.fromDetail(page.schoolDetail);
      expect(school2.id).toEqual(targetSchool.id);
      expect(school2.name).toEqual(targetSchool.name.toUpperCase());
    });
  });

  async function dashboardSelectTargetSchool() {
    let targetSchoolElt = getPageElts().topSchools.get(targetSchoolDashboardIndex);
    expect(targetSchoolElt.getText()).toEqual(targetSchool.name);
    targetSchoolElt.click();
    browser.waitForAngular(); // seems necessary to gets tests to pass for toh-pt6

    let page = getPageElts();
    expect(page.schoolDetail.isPresent()).toBeTruthy('shows school detail');
    let school = await School.fromDetail(page.schoolDetail);
    expect(school.id).toEqual(targetSchool.id);
    expect(school.name).toEqual(targetSchool.name.toUpperCase());
  }

  async function updateSchoolNameInDetailView() {
    // Assumes that the current view is the school details view.
    addToSchoolName(nameSuffix);

    let page = getPageElts();
    let school = await School.fromDetail(page.schoolDetail);
    expect(school.id).toEqual(targetSchool.id);
    expect(school.name).toEqual(newSchoolName.toUpperCase());
  }

});

function addToSchoolName(text: string): promise.Promise<void> {
  let input = element(by.css('input'));
  return input.sendKeys(text);
}

function expectHeading(hLevel: number, expectedText: string): void {
    let hTag = `h${hLevel}`;
    let hText = element(by.css(hTag)).getText();
    expect(hText).toEqual(expectedText, hTag);
};

function getSchoolAEltById(id: number): ElementFinder {
  let spanForId = element(by.cssContainingText('li span.badge', id.toString()));
  return spanForId.element(by.xpath('..'));
}

function getSchoolLiEltById(id: number): ElementFinder {
  let spanForId = element(by.cssContainingText('li span.badge', id.toString()));
  return spanForId.element(by.xpath('../..'));
}

async function toSchoolArray(allSchools: ElementArrayFinder): Promise<School[]> {
  let promisedSchools = await allSchools.map(School.fromLi);
  // The cast is necessary to get around issuing with the signature of Promise.all()
  return <Promise<any>> Promise.all(promisedSchools);
}
