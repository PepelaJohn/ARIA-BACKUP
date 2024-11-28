const corsOptions = {
  origin: 'https://aria-backup.vercel.app', // Specify your frontend URL
  credentials: true,               // Allow cookies and credentials
  optionsSuccessStatus: 200        // Some legacy browsers choke on 204
};

export default corsOptions;
