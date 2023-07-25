const Joi = require('joi');

class Validation {
    create(data) {
        const schema = Joi.object({
            title: Joi.string().min(3).max(1000).required(),
            description: Joi.string().min(3).max(1000).required(),
            imageLink: Joi.any(),
        });
        return schema.validate(data);
    }

    title(data)  {
        const schema = Joi.object({
            title: Joi.string().min(3).max(1000).required(),
        });
        return schema.validate(data);
    }
    
    update(data) {
        const schema = Joi.object({
            id: Joi.number().positive().required(),
            title: Joi.string().min(3).max(1000).optional(),
            description: Joi.string().min(3).max(1000).optional(),
            imageLink: Joi.any(),
        });
        return schema.validate(data);
    }

    params(data) {
        const schema = Joi.object({
            id: Joi.number().positive().required()
        });
        return schema.validate(data);
    }
   
    skipLimit(data) {
        const schema = Joi.object({
            skip: Joi.number().min(0),
            limit: Joi.number().positive().default(10)
        });
        return schema.validate(data);
    }
}

module.exports = new Validation();