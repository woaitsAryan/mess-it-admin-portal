const catchAsync = (fn) => (req, res, next) => {
    fn(req, res, next).catch((err) => {
        console.error(err);
        next(err);
    });
};
export default catchAsync;
//# sourceMappingURL=catchAsync.js.map