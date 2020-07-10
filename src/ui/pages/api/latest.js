import nextConnect from 'next-connect';
import middleware from '../../middleware/database';

const PAC_CONFIG = require('../../../common/constants');

const handler = nextConnect();

handler.use(middleware);

handler.get(async (req, res) => {
    let { page } = req.query;
    let pageNo = parseInt(page)
    if(!pageNo) {
        pageNo = 1
    }

    let dbQuery = {};

    let sort = -1;
    if('sort' in req.query) {
        if(parseInt(req.query.sort) === 1) {
            sort = 1;
        }
    }


    if('age' in req.query) {
        let { age } = req.query;
        dbQuery.victimAge = parseInt(age);
    }

    if('year' in req.query) {
        let { year } = req.query;
        dbQuery.year = parseInt(year);
    }

    if('month' in req.query) {
        let { month } = req.query;
        dbQuery.month = parseInt(month);
    }

    if('country' in req.query) {
        let { country } = req.query;
        dbQuery.locationCountry = country;
    }

    if('state' in req.query) {
        let { state } = req.query;
        dbQuery.locationStateCode = state;
    }

    if('race' in req.query) {
        let { race } = req.query;
        dbQuery.victimRace = race;
    }

    if('gender' in req.query) {
        let { gender } = req.query;
        dbQuery.victimGender = gender;
    }

    if('source' in req.query) {
        let { source } = req.query;
        dbQuery.source = source;
    }

    if('armed' in req.query) {
        let { armed } = req.query;

        switch(armed) {
            case 'Armed':
                dbQuery.victimArmed = { $nin : ['Unarmed','N/A','Unclear','Allegedly']};
                break;
            case 'Unarmed':
            case 'N/A':
            case 'Unclear':
            case 'Allegedly':
                dbQuery.victimArmed = armed;
                break;
            default:
                break;
        }
    }

    let limit = 20;
    let skip = ( pageNo - 1 ) * limit

    let numRows = await req.db.collection(PAC_CONFIG.INCIDENT_REPORT_COLLECTION).find(dbQuery).count();
    let numPages = Math.floor(numRows / limit);

    let data = await req.db.collection(PAC_CONFIG.INCIDENT_REPORT_COLLECTION)
        .find(dbQuery, {projection:{ _id: 0 }})
        .sort({ sourceDatetime: sort })
        .skip(parseInt(skip))
        .limit(parseInt(limit)).toArray();

    let dataResults = {
        dbQuery: dbQuery,
        data: data,
        pages: {
            totalPages: numPages,
            total: numRows,
            currentPage: pageNo
        }
    }
    res.json(dataResults);
});

export default handler;
