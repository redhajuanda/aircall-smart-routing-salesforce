const sf = require('node-salesforce')
const conn = new sf.Connection();
const config = require('./config');
const request = require('request');

function getEmailConsultant(phone) {
    return new Promise((resolve, reject) => {
        conn.login(config.SF_USERNAME, config.SF_PASSWORD, (err, userInfo) => {
            if (err) { reject(err) }

            // format phone number 
            phone = phone.split(" ")[1].replace(/-/g, "");
            const query = `SELECT MobilePhone, phone, Owner_Email__c FROM Contact WHERE MobilePhone LIKE'%${phone}' `;
            conn.query(query, function (err, result) {
                if (err) { reject(err) }
                resolve(result.records[0].Owner_Email__c);
            })
        })
    })
}

function getIdAircallConsultant(consultantEmail) {
    return new Promise((resolve, reject) => {
        const uri = `https://${config.AC_API_ID}:${config.AC_API_TOKEN}@api.aircall.io/v1/users`;
        request.get(uri, (error, response, body) => {
            if (error) { reject(error) }
            const data = JSON.parse(body);
            const agent = data.users.find((user) => {
                return user.email === consultantEmail;
            });

            if (agent) {
                resolve(agent);
            }
            else {
                resolve({ 'msg': 'No data' })
            }

        })
    })
}

function forwardCall(callId, userId) {
    return new Promise((resolve, reject) => {
        const uri = `https://${config.AC_API_ID}:${config.AC_API_TOKEN}@api.aircall.io/v1/calls/${callId}/transfers`;
        request.post(uri, { json: { user_id: userId } }, (error, response, body) => {
            if (error) { reject(error) }
            // resolve(console.log(`Call ${callId} transferred to ${userId}`))
            resolve(response);

        })
    })
}

function getCalls(callId) {
    return new Promise((resolve, reject) => {
        const uri = `https://${config.AC_API_ID}:${config.AC_API_TOKEN}@api.aircall.io/v1/calls/${callId}`;
        request.get(uri, (error, response, body) => {
            if (error) { reject(error) }
            // resolve(console.log(`Call ${callId} transferred to ${userId}`))
            resolve(response, body);
        })
    })
}

module.exports = {
    getEmailConsultant: getEmailConsultant,
    getIdAircallConsultant: getIdAircallConsultant,
    forwardCall: forwardCall,
    getCalls: getCalls
};