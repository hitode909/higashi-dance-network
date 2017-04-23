module.exports = {
    "parser": "babel-eslint",
    "plugins": [
        "flowtype"
    ],
    "env": {
        "browser": true,
        "es6": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "sourceType": "module"
    },
    "rules": {
        "indent": [
            "error",
            2
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        "flowtype/define-flow-type": 1,
        "flowtype/use-flow-type": 1
    },
    "globals": {
        "$": true,
        "_": true
    },
};
