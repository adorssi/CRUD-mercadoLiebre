const fs = require('fs');
const path = require('path');

const productsFilePath = path.join(__dirname, '../data/productsDataBase.json');
const categoriesFilePath = path.join(__dirname, '../data/categories.json');

const products = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));
const categories = JSON.parse(fs.readFileSync(categoriesFilePath, 'utf-8'));

const imagesPath = path.join(__dirname, '../../public/images/products/');

const toThousand = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const controller = {
	// Root - Show all products
	index: (req, res) => {
		res.render('products', {products: products});
	},

	// Detail - Detail from one product
	detail: (req, res) => {
		const id = Number(req.params.id);
		const productToVisit = products.filter( product => product.id === id);
		res.render('detail', {product: productToVisit[0]});
	},

	// Create - Form to create
	create: (req, res) => {
		res.render('product-create-form');
	},
	
	// Create -  Method to store
	store: (req, res) => {
		const id = Date.now();
		const {name, price, discount, category, description} = req.body;
		const image = req.file.filename;
		const productObj = {
			id,
			name,
			price: Number(price),
			discount: Number(discount),
			category,
			description,
			image
		}
		products.unshift(productObj);
		const productJSON = JSON.stringify(products);
		fs.writeFileSync(productsFilePath, productJSON);

		res.redirect('/products');
	},

	// Update - Form to edit
	edit: (req, res) => {
		const id = Number(req.params.id);
		const productToEdit = products.filter( product => product.id === id);
		res.render('product-edit-form', {product: productToEdit[0], categories: categories});
	},
	// Update - Method to update
	update: (req, res) => {
		const id = Number(req.params.id);
		let image;
		const {name, price, discount, category, description} = req.body;
		products.forEach( product => {
			if(product.id === id) {
				if(req.file) {
					image = req.file.filename;
					fs.unlink(imagesPath + product.image, (err) => {
						if(err) throw err;
						console.log(err);
					})
				};

				product.name = name;
				product.price = Number(price);
				product.discount = Number(discount);
				product.category = category;
				product.description = description;
				product.image = image || product.image;

				const productJSON = JSON.stringify(products);
				fs.writeFileSync(productsFilePath, productJSON);
			}
		});
		res.redirect('/products');
	},

	// Delete - Delete one product from DB
	destroy : (req, res) => {
		const id = Number(req.params.id);
		const updateProducts = products.filter( product => product.id != id);
		const productJSON = JSON.stringify(updateProducts);
		fs.writeFileSync(productsFilePath, productJSON);
		products.forEach( product => {
			if(product.id === id) {
				fs.unlink(imagesPath + product.image, (err) => {
					if(err) throw err;
					console.log(err);
				});
			}
		});
		res.redirect('/products');
		
	}
};

module.exports = controller;