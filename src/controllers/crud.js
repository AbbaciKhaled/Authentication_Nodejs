module.exports = {
    readAll: (Model) => {
        return function (req, res) {
            Model.findAll({
            })
                .then(function (model) {
                    if (model) {
                        return res.status(200).json(model);
                    }
                    else {
                        return res.status(409).json({ 'error': 'users not exist' });
                    }
                })
                .catch(function (err) {
                    return res.status(500).json({ 'error': 'unable to verify user' });
                });
        }
    },
    readOne: (Model) => {
        return function (req, res) {
            Model.findOne({
                where: { id: req.params.id }
            })
                .then(function (model) {
                    if (model) {
                        return res.status(200).json(model);
                    }
                    else {
                        return res.status(409).json({ 'error': 'user not exist' });
                    }
                })
                .catch(function (err) {
                    return res.status(500).json({ 'error': 'unable to verify user' });
                });
        }
    },
    create: (Model) => {
        return function (req, res) {
            Model.create(req.body)
                .then(function (model) {
                    if (model) {
                        return res.status(201).json({ model });
                    } else {
                        return res.status(500).json({ 'error 500': 'cannot add element' });
                    }

                })
                .catch(function (err) {
                    return res.status(500).json({ 'error 500': 'cannot add element' });
                });
        }
    },
    update: (Model) => {
        return function (req, res) {
            Model.findOne({
                where: { id: req.params.id }
            })
                .then(function (model) {
                    if (model) {
                        model.update(req.body)
                        return res.status(200).json(model);
                    }
                    else {
                        return res.status(409).json({ 'error': 'element not exist' });
                    }
                })
                .catch(function (err) {
                    return res.status(500).json({ 'error': 'unable to verify element' });
                });
        }
    },
    remove: (Model) => {
        return function (req, res) {
            Model.destroy({
                where: { id: req.params.id }
            })
                .then(function (model) {
                    if (model) {
                        return res.status(200).json(model);
                    }
                    else {
                        return res.status(409).json({ 'error': 'element not exist' });
                    }
                })
                .catch(function (err) {
                    return res.status(500).json({ 'error': 'unable to delete element' });
                });
        }
    }
};
