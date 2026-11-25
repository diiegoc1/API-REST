import bcrypt from "bcryptjs";

const clave = process.argv[2];
if(!clave){
    console.log("Uso: npm run hash -- tuClave");
    process.exit(1);
}
console.log(await bcrypt.hash(clave,10));