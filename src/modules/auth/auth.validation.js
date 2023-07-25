const Joi = require('joi');

class Validation {
    register(data) {
        const schema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().min(3).max(30).required(),
            first_name: Joi.string().min(3).max(30).required(),
            last_name: Joi.string().min(3).max(30).required()
        });
        return schema.validate(data);
    }

    login(data) {
        const schema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().min(3).max(30).required()
        });
        return schema.validate(data);
    }
}

module.exports = new Validation();