const express = require('express');
const router = express.Router();

// Usando um Model de forma externa no mongoose
    const mongoose = require('mongoose');
    require('../models/Categoria');
    // Passando uma referência do Model para uma variável
        const Categoria = mongoose.model('categorias');

router.get('/', (req, res) => {
    res.render('admin/index');
});

router.get('/posts', (req, res) => {
    res.send("Página de posts!");
});

/* ROTA ADMIN/CATEGORIAS */
    router.get('/categorias', (req, res) => {
        Categoria.find()
                 .sort({date: 'desc'})   
                 .then((categorias) => {
                    res.render('admin/categorias', {categorias: categorias});
                 })   
                 .catch((error) => {
                    req.flash("error_msg", "Houve um erro ao listar as categorias");
                    res.redirect('/admin');
                 });
    });

router.get('/categorias/add', (req, res) => {
    res.render('admin/addcategorias');
});

/* ROTA NOVA CATEGORIA */
    router.post('/categorias/nova', (req, res) => {
        
        var erros = [];

        if(!req.body.name || typeof req.body.name == undefined || req.body.name == null){
            erros.push({texto: "Nome inválido"});
        }

        if(req.body.name.length < 2){
            erros.push({texto: "Nome da categoria muito pequeno"});
        }

        if(erros.length > 0){
            res.render("admin/addcategorias", {erros: erros});
        } else {
            const novaCategoria = {
                nome: req.body.name,
                slug: req.body.slug
            };
        
            new Categoria(novaCategoria)
                .save()
                .then(() => {
                    req.flash("success_msg", "Categoria criada com sucesso!");
                    res.redirect('/admin/categorias');
                })
                .catch((error) => {
                    req.flash("error_msg", "Erro ao criar categoria, tente novamente");
                    res.redirect('/admin');
                });
        }
    });

/* EDIÇÃO DE CATEGORIA */
    router.get('/categorias/edit/:id', (req, res) => {
        Categoria.findOne({_id: req.params.id})
                 .then((categoria) => {
                    res.render('admin/editcategorias', {categoria: categoria});
                 })
                 .catch((error) => {
                    req.flash("error_msg", "Essa categoria não existe!");
                    res.redirect('/admin/categorias');
                 });
    });

/* APLICANDO EDIÇÃO DE CATEGORIA - POST */
    router.post('/categorias/edit', (req, res) => {
        Categoria.findOne({_id: req.body.id})
                 .then((categoria) => {
                    categoria.nome = req.body.name;
                    categoria.slug = req.body.slug;

                    categoria.save()
                             .then(() => {
                                req.flash("success_msg", "Categoria editada com sucesso!");
                                res.redirect("/admin/categorias");
                             })
                             .catch((error) => {
                                req.flash("error_msg", "Erro ao salvar categoria editada!");
                                res.redirect("/admin/categoria");
                             });
                 })
                 .catch((error) => {
                    console.log(error);
                    req.flash("error_msg", "Houve um erro ao editar a categoria: " + error);
                    res.redirect("/admin/categorias");
                 });
    });

/* DELETAR CATEGORIA */
router.post('/categorias/deletar', (req, res) => {
    Categoria.deleteOne({_id: req.body.id})
            .then(() => {
                req.flash("success_msg", "Categoria deletada com sucesso!");
                res.redirect('/admin/categorias');
            })
            .catch((error) => {
                req.flash("error_msg", "Erro ao deletar categoria: " + error);
                res.redirect('/admin/categorias');
            });
});

/* ROTAS DE POSTAGENS */
router.get('/postagens', (req, res) => {
    res.render('admin/postagens');
});

/* ADICIONANDO NOVA POSTAGEM */
router.get('/postagens/add', (req, res) => {

    /* Passa todas as categorias que existe no banco de dados
    para a nossa view de postagens (nova postagem) */
        Categoria.find()
                .then((categorias) => {
                    res.render('admin/addpostagem', {categorias: categorias});
                })
                .catch((error) => {
                    req.flash("error_msg", "Erro ao criar categoria: " + error);
                    res.rendirect('/admin/postagens');
                });
});






module.exports = router;