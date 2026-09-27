import { ZodError } from 'zod';

const validate = (schemas) => {
    return (req, res, next) => {
        try {
            const validatedData = {};

            if (schemas.body) {
                validatedData.body = schemas.body.parse(req.body);
            }

            if (schemas.params) {
                validatedData.params = schemas.params.parse(req.params);
            }

            if (schemas.query) {
                validatedData.query = schemas.query.parse(req.query);
            }

            req.validatedData = validatedData;

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: error.issues
                });
            }

            next(error);
        }
    };
};

export default validate;