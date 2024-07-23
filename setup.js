const { setupJC } = require('./tests/JC/JC-user');
const { setupQ0 } = require('./tests/Q0/Q0-user');
const { setupQ1 } = require('./tests/Q1/Q1-user');
const { setupQ2 } = require('./tests/Q2/Q2-user');
const { setupQ3 } = require('./tests/Q3/Q3-user');
const { setupQ6 } = require('./tests/Q6/Q6-user');
const { setupQ8 } = require('./tests/Q8/Q8-user');
const { setupVN } = require('./tests/VN/VN-user');
const { setupTK } = require('./tests/TK/TK-user');
const { setupMY } = require('./tests/MY/MY-user');
const { setupSG } = require('./tests/SG/SG-user');


const globalSetup = async () => {
    await setupJC();
    await setupQ0();
    await setupQ1();
    await setupQ2();
    await setupQ3();
    await setupQ6();
    await setupQ8();
    await setupVN();
    await setupTK();
    await setupMY();
    await setupSG()

};

const setupMapping = {
    'JC': setupJC,
    'Q0': setupQ0,
    'Q1': setupQ1,
    'Q2': setupQ2,
    'Q3': setupQ3,
    'Q6': setupQ6,
    'Q8': setupQ8,
    'VN': setupVN,
    'TK': setupTK,
    'MY': setupMY,
    'SG': setupSG
};

module.exports = async () => {
    const platform = process.env.PLATFORM;
    if (platform && setupMapping[platform]) {
        await setupMapping[platform]();
    } else {
        await globalSetup();
    }
};