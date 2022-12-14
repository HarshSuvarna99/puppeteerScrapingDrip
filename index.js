const puppeteer = require('puppeteer');
const fs = require('fs/promises')
const convertJsonToExcel = require('./excelWrite')
async function start() {
    //creating browser instance and tab
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://www.lacbffa.org/directory?current_page=1&sort_type=featured&search_for=company&asset_type=company_user&display_type=default")
    //array to store all scaraped data in object form
    let allProfile = []
    //loop along the pages
    for (let i=0; i<22; i++){
        //getting all the links in the page
        const hrefs = await page.evaluate(() => {
            let links = [];
            let elements2 = document.querySelectorAll('.btn-block');
            for (let element2 of elements2)
                if(element2){
                    links.push(element2.href);
                }
            return links;
            });
        //removing null values in list
        allHrefs = [...new Set(hrefs)].filter(el=>el!==null);
        //loop on the cards in the page
        for (const link of allHrefs){
            //go to this page
            await page.goto(link)
            objs = {}
            //await page.waitForNavigation();

            //scraping contact info
            try{
            await page.waitForSelector("#content > div.company-body > div > div > div.col-md-4 > div.subcontainer_style3.company-contact", {
                timeout:10000,
                visible: true,
            });
            
            try{
            //scraping company name
            await page.waitForSelector("#content > div.company-page-header.relative.no-company-brief > div > div > div.col-md-7.col-lg-8.company-profile-header-leftcol > div > h2", {
                timeout:10000,
                visible: true,
            });
            let compName = await page.$eval("#content > div.company-page-header.relative.no-company-brief > div > div > div.col-md-7.col-lg-8.company-profile-header-leftcol > div > h2", (el)=>el.innerText)
            objs = {CompanyName: compName} 
            }catch(err){console.log('No name')}
            let info = await page.$eval("#content > div.company-body > div > div > div.col-md-4 > div.subcontainer_style3.company-contact > div > table > tbody", (el)=>el.innerText)
            infos = info.split("\n").map((x)=> {objs[x.split(":")[0]] = x.split(": ")[1]})
            
            allProfile.push(objs)
        }catch(err){console.log(console.log('No data found'));}
            await page.goBack();
            }
    //wait for the selector to show up in the newly nagivated page
    await page.waitForSelector("#main_content > div.pagination_app_div > div.row > div.col-sm-8 > div > div > div:nth-child(1) > div.btn-group.btn-group-sm.next-button > a", {
        timeout:10000,
        visible: true,
    });
    console.log(i)
    //click on next button to nagivate to next page
    if(i!==22){
        await page.click("#main_content > div.pagination_app_div > div.row > div.col-sm-8 > div > div > div:nth-child(1) > div.btn-group.btn-group-sm.next-button > a")
    }
    }
    console.log(allProfile);
    console.log("xxxxxxxEXECUTION ENDEDxxxxxxxxxxxx");
    //export xlsx
    convertJsonToExcel(allProfile)
    browser.close()
}
start()

