const Home = require('../models/qp');
const Contact=require('../models/contact');
const rootDir = require('../utils/pathutils');
const path = require('path');
const axios = require('axios');
const PDFdocument = require('pdfkit');
exports.getHome = async (req, res, next) => {
    const pd = await Home.find();
    const sem = pd.map((data) => data.semester);
    const semester = [...new Set(sem)];
    Home.find().then(qpdata => {
        res.render('index', { islogedin: req.session.isLogedin, qpdata, semester });
    })

}

exports.getDetails = (req, res, next) => {
    res.render('viewitem', { islogedin: req.session.isLogedin });
}
exports.getViewPaper = (req, res, next) => {
    Home.findById(req.params.id).then((oneqp) => {
        oneqp = oneqp.photos;
        res.render('viewpaper', { oneqp });
    });
}
exports.getdownload = async (req, res, next) => {
    const oneqp = await Home.findById(req.params.id);

    const files = oneqp.photos.map(img => {
        return {
            path: img.photo.replace(/\\/g, '/'),
            name: img.originalname
        }
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=image.pdf');

    const doc = new PDFdocument();
    doc.pipe(res);
    let i = 0;
    for (const file of files) {
        const response = await axios.get(file.path, { responseType: 'arraybuffer' });

        if (i !== 0) doc.addPage();
        doc.image(response.data, {
            fit: [500, 400],
            align: 'center',
            valign: 'center'
        });
        i++;
    }
    doc.end();
}
exports.getAbout = (req, res) => {
    res.render('about',{islogedin:req.session.isLogedin});
}
exports.getContact=(req,res)=>{
    res.render('contact',{islogedin:req.session.isLogedin});
}
exports.postContact=async(req,res)=>{
    const {userName,email,msg}=req.body;
    const contact=await Contact({userName,email,msg});
    await contact.save();
    res.redirect('/');
}