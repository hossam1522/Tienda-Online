import express   from "express"
import nunjucks  from "nunjucks"
import session from "express-session"
import cookieParser from "cookie-parser"
import jwt from "jsonwebtoken"
      
import connectDB from "./model/db.js"
connectDB()

const app = express()

const IN = process.env.IN || 'development'

nunjucks.configure('views', {         // directorio 'views' para las plantillas html
	autoescape: true,
	noCache:    IN == 'development',   // true para desarrollo, sin cache
	watch:      IN == 'development',   // reinicio con Ctrl-S
	express: app
}).addFilter('urlencode', function(str) {
  return encodeURIComponent(str);
});

app.set('view engine', 'html')

app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'))     // directorio public para archivos

/* app.use(session({
	secret: 'my-secret',      // a secret string used to sign the session ID cookie
	resave: false,            // don't save session if unmodified
	saveUninitialized: false  // don't create session until something stored
}))

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
}); */

app.use(session({
  secret: 'my-secret',
  resave: false,
  saveUninitialized: false
}));

app.use(cookieParser())

// middleware de
/* const autentificación = (req, res, next) => {
	const token = req.cookies.access_token;
	if (token) {
		const data = jwt.verify(token, process.env.SECRET_KEY);
		req.username = data.usuario  // username en el request
	}
	next()
}

app.use(autentificación) */

const autentificación = (req, res, next) => {
  const token = req.cookies.access_token;
  if (token) {
    try {
      const data = jwt.verify(token, process.env.JWT_SECRET);
      req.session.user = { username: data.username };
    } catch (error) {
      console.error('Error al verificar el token:', error);
    }
  }
  next();
};

app.use(autentificación);

/* app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
}); */

app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.user = req.session.user || null;
  next();
});



// Las demas rutas con código en el directorio routes
import TiendaRouter from "./routes/router_tienda.js"
import UsuariosRouter from "./routes/router_usuarios.js"
app.use("/", TiendaRouter);
app.use("/", UsuariosRouter);


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutandose en  http://localhost:${PORT}`);
})