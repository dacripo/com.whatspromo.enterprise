let fetch = require('isomorphic-fetch');
var mobileDetect = require('mobile-detect');
var md5 = require('md5');
let request = require('request-promise');

const uuidV4 = require('uuid/v4');
var Jimp = require("jimp");


let getPromotionsByCompanyId = async (companyId) => {
    try {
        let response = await fetch('http://localhost:3000/promotion/company/' + companyId, { method: 'get' });
        let data = await response.json();
        if (response.status !== 200) {
            return;
        }
        return data;
    } catch (error) {

        console.error('Fetch error. STATUS: ' + response.status);
        console.error(error);
    }
}




let createCompany = async (companyEmail) => {
    var formData = {
        "cif": md5(companyEmail),
        "email": companyEmail
    };

    return new Promise( async(resolve,reject) => {

        let response = await request.post({ url: 'http://localhost:3000/company/', form: formData });
        console.log(response);
         if (response.status !== 200) {
            reject();
        }
        resolve(response);
    })

}

let getOrCreateCompany = async (companyEmail) => {
    console.log('Getting / Creating company');
    try {
        let response = await fetch('http://localhost:3000/company/email/' + companyEmail, { method: 'get' });
        let company = await response.json();

        if (response.status == 404) {
            console.log("Trying to create a company.");
            let company = await createCompany(companyEmail);
            return company;
        } else if (response.status !== 200) {
            console.log('Company not created.' + response);
            return;
        } else {
            console.log('Company already exists');
            return company;
        }

    } catch (error) {
        console.error('Fetch error. STATUS');
        console.error(error);
    }




}

let newPromotion = async (promotion) => {


    var formData = {
        "promoType": promotion.promoType,
        "promoId": promotion.promoId,
        "priceItemAvg": promotion.priceItemAvg,
        "promoEnabled": promotion.promoEnabled,
        "startDate": promotion.startDate,
        "endDate": promotion.endDate,
        "promoTitle": promotion.promoTitle,
        "promoLegalCond": promotion.promoLegalCond,
        "promoDescription": promotion.promoDescription,
        "promoContactDetails": promotion.promoContactDetails,
        "promoImage": promotion.promoImage,
        "socialImage": promotion.socialImage,
        "winnersNumber": promotion.winnersNumber,
        "showLocalization": promotion.showLocalization,
        "lat": promotion.lat,
        "lng": promotion.lng,
        "postalCode": promotion.postalCode,
        "fullAddress": promotion.fullAddress,
        "companyId": promotion.companyId,
        "trollNumber": promotion.trollNumber,
        "shareMessages": promotion.shareMessages,
        "facebookTrackingPixel": promotion.facebookTrackingPixel,
        "googleTrackingPixel": promotion.googleTrackingPixel
    };


    let response = await request.post({ url: 'http://localhost:3000/promotion/', form: formData });
    console.log(response);
    return response;
};


let updatePromotion = async (promotion) => {

    var formData = {
        "promoType": promotion.promoType,
        "promoId": promotion.promoId,
        "priceItemAvg": promotion.priceItemAvg,
        "promoEnabled": promotion.promoEnabled,
        "startDate": promotion.startDate,
        "endDate": promotion.endDate,
        "promoTitle": promotion.promoTitle,
        "promoLegalCond": promotion.promoLegalCond,
        "promoDescription": promotion.promoDescription,
        "promoContactDetails": promotion.promoContactDetails,
        "promoImage": promotion.promoImage,
        "socialImage": promotion.socialImage,
        "winnersNumber": promotion.winnersNumber,
        "showLocalization": promotion.showLocalization,
        "lat": promotion.lat,
        "lng": promotion.lng,
        "postalCode": promotion.postalCode,
        "fullAddress": promotion.fullAddress,
        "companyId": promotion.companyId,
        "trollNumber": promotion.trollNumber,
        "shareMessages": promotion.shareMessages,
        "facebookTrackingPixel": promotion.facebookTrackingPixel,
        "googleTrackingPixel": promotion.googleTrackingPixel
    };

    let response = await request.put({ url: 'http://localhost:3000/promotion/' + promotion.updatePromotionId, form: formData });
    console.log(response);
    return response;
};


/**
 * mainController.js
 *
 * @description :: Server-side logic.
 */
module.exports = {
    /**
     * mainController.showMainIndex()
     */
    showMainIndex: async function (req, res) {
        var promoId = req.params.promoId;
        var refFriend = req.params.refFriend;

        let companyEmail = req.cookies.companyEmail;
        console.log(companyEmail);

        //Create company if not exists
        try {
            if (companyEmail) {
                // Promise.all(iterable)
                let company = await getOrCreateCompany(companyEmail);
                if (!company) { console.log('Company not found'); }
                else {

                    let promotions = await getPromotionsByCompanyId(company._id);


                    let md = new mobileDetect(req.headers['user-agent']);
                    if (md.is('bot')) {
                        console.log('bot access');
                    } else if (md.mobile() != null) {
                        console.log('phone access');
                    } else if (md.is('desktopmode')) {
                        console.log('desktopmode access');
                    } else {
                        console.log('other device access');
                    }


                    let options = {
                        maxAge: 1000 * 60 * 15, // would expire after 15 minutes
                        httpOnly: true, // The cookie only accessible by the web server
                        signed: false // Indicates if the cookie should be signed
                    }


                    if (company) {
                        console.log('companyId: '+company._id)
                        // Set cookie
                        res.cookie('companyId', company._id, options) // options is optional


                        //Desktop view
                        res.render('desktop-version', { title: 'WhatsPromo - Panel de control', promotions: promotions });
                    }



                }
            }
        } catch (error) {
            console.log(error);
        }
    },



    /**
     * mainController.promotionIdAvailable()
     */
    promotionIdAvailable: async function (req, res) {
        var promoId = req.params.promoId;

        try {
            let response = await fetch('http://localhost:3000/promotion/available/' + promoId, { method: 'GET' });
            let data = await response.json();
            if (response.status !== 200) {
                return res.status(500).json({ response: response });
            }
            return res.status(200).json(data);

        } catch (error) {
            console.error('Fetch error. ');
            console.error(error);
            return res.status(500).json({
                error: error
            });
        }

    },


    /**
     * mainController.promotionIdAvailable()
     */
    showPromotion: async function (req, res) {
        var promoId = req.params.promoId;

        try {
            let response = await fetch('http://localhost:3000/promotion/' + promoId, { method: 'GET' });
            let data = await response.json();
            if (response.status !== 200) {
                return res.status(500).json({ response: response });
            }
            return res.status(200).json(data);

        } catch (error) {
            console.error('Fetch error. ');
            console.error(error);
            return res.status(500).json({
                error: error
            });
        }

    },
    /**
     * mainController.getPromotions()
     */
    getPromotions: async function (req, res) {
        let companyId = req.cookies.companyId;
        return await getPromotionsByCompanyId(companyId);
    },
    /**
     * mainController.createUpdatePromotion()
     */
    createUpdatePromotion: async function (req, res) {

        let promotion = {};
        promotion.promoType = req.cookies.pt; //0=Free,1=Basic,2=Premium 
        promotion.promoId = req.body.promoId;
        promotion.promoEnabled = req.body.promoEnabled;
        promotion.startDate = req.body.startDate;
        promotion.endDate = req.body.endDate;
        promotion.promoTitle = req.body.promoTitle;
        promotion.promoLegalCond = req.body.promoLegalCond;
        promotion.promoDescription = req.body.promoDescription;
        promotion.promoContactDetails = req.body.promoContactDetails;
        promotion.promoImage = req.body.promoImage;
        promotion.socialImage = req.body.socialImage;
        promotion.winnersNumber = req.body.winnersNumber;
        promotion.showLocalization = req.body.showLocalization;
        promotion.lat = req.body.lat;
        promotion.lng = req.body.lng;
        promotion.postalCode = req.body.postalCode;
        promotion.fullAddress = req.body.fullAddress;
        promotion.companyId = req.cookies.companyId;
        promotion.trollNumber = req.body.trollNumber;
        promotion.shareMessages = req.body.shareMessages;
        promotion.facebookTrackingPixel = req.body.facebookTrackingPixel;
        promotion.googleTrackingPixel = req.body.googleTrackingPixel;

        if (req.body.updatePromotionId) {
            promotion.updatePromotionId = req.body.updatePromotionId;
            let updatedPromo = await updatePromotion(promotion);
            console.log('updated promotion: ' + updatedPromo)
        } else {
            let newPromo = await newPromotion(promotion);
            console.log('created promotion: ' + newPromo)
        }

    },
    /**
     * mainController.loadPromoImage()
     */
    loadPromoImage: function (req, res) {
        if (!req.files)
            return res.status(400).send('No files were uploaded.');
        let hostname = req.headers.host;
        let userImage = req.files.userfile;

        let modulePath = 'public/images/promo/';
        let imageTitle = 'promo_' + uuidV4();
        var filePathWithoutExt = modulePath + imageTitle;

        Jimp.read(userImage.data).then(function (img) {
            let file = filePathWithoutExt + '.jpg';
            img.scaleToFit(600, 400)
                .quality(80)   // set JPEG quality
                .write(file, () => {
                    return res.status(200).json({ url: hostname + '/' + filePathWithoutExt + '.jpg' });
                }) // save
        }).catch(function (err) {
            console.error(err);
        });

    },
    /**
         * mainController.loadSocialImage()
         */
    loadSocialImage: function (req, res) {
        if (!req.files)
            return res.status(400).send('No files were uploaded.');
        let hostname = req.headers.host;
        let userImage = req.files.userfile;

        let modulePath = 'public/images/social/';
        let imageTitle = 'social_' + uuidV4();
        var filePathWithoutExt = modulePath + imageTitle;

        Jimp.read(userImage.data).then(function (img) {
            let file = filePathWithoutExt + '.jpg';
            img.scaleToFit(600, 400)
                .quality(80)   // set JPEG quality
                .write(file, () => {
                    return res.status(200).json({ url: hostname + '/' + filePathWithoutExt + '.jpg' });
                }) // save
        }).catch(function (err) {
            console.error(err);
        });
    }

}
