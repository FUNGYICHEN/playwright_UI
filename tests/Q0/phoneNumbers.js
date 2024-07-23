function randomHongKongPhoneNumber() {
    const prefix = ['512', '513', '514', '516', '517', '519', '612', '613', '614', '616', '617', '618', '619', '712', '713', '714', '715', '716', '717', '718', '719', '912', '913', '914', '915', '916', '917', '918'];
    const randomPrefix = prefix[Math.floor(Math.random() * prefix.length)];
    const randomNumber = Math.floor(1000 + Math.random() * 10000).toString().padStart(5, '0'); // 确保随机数有4位数字
    return randomPrefix + randomNumber;
}

function randomUsername() {
    const length = Math.floor(Math.random() * 7) + 6; // 生成6到12位的用户名
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    let username = '';

    // 保证用户名中至少包含一个字母和一个数字
    username += letters.charAt(Math.floor(Math.random() * letters.length));
    username += numbers.charAt(Math.floor(Math.random() * numbers.length));

    // 生成剩余的字符
    const characters = letters + numbers;
    for (let i = 2; i < length; i++) {
        username += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return username;
}

module.exports = { randomHongKongPhoneNumber, randomUsername };