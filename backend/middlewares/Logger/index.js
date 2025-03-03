const Logger = (req, res, next) => {
    console.log(`Received Request to ${req.url} at "${new Date(Date.now()).toLocaleString()}"`);
    next();
};

export default Logger;