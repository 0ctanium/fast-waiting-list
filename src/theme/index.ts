import { createMuiTheme } from '@material-ui/core/styles';
import { frFR } from '@material-ui/core/locale';

const theme = createMuiTheme(
  {
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        'Segoe UI',
        'Roboto',
        'Oxygen',
        'Ubuntu',
        'Cantarell',
        'Fira Sans',
        'Droid Sans',
        'Helvetica Neue',
        'sans-serif',
      ].join(','),
      h1: {
        fontSize: '3rem',
        fontWeight: 700,
        lineHeight: 1.15,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
        lineHeight: 1.15,
      },
      h3: {
        fontSize: '1.5rem',
        fontWeight: 500,
        lineHeight: 1.15,
      },
      h4: {
        fontSize: '1.2rem',
        fontWeight: 400,
        lineHeight: 1.15,
      },
      h5: {
        fontSize: '1rem',
        fontWeight: 400,
        lineHeight: 1.15,
      },
    },
    props: {
      MuiButton: {
        disableRipple: true,
      },
      MuiCard: {
        elevation: 0,
      },
    },
    overrides: {
      MuiButton: {
        root: {
          background: 'rgb(239, 239, 239)',
        },
        outlined: {
          padding: '6px 12px',
          border: '1px solid #eaeaea',
          borderRadius: 10,
          transition: 'color .15s ease,border-color .15s ease',
          '&:hover': {
            color: '#0070f3',
            borderColor: '#0070f3',
          },
        },
        label: {
          textTransform: 'none',
        },
      },
      MuiPaper: {
        elevation0: {
          boxShadow: '0 0 6px 3px rgba(0,0,0,.3)',
        },
      },
      MuiCardContent: {
        root: {
          padding: '1.5rem 1.5rem 3.5rem',
        },
      },
      MuiCardHeader: {
        title: {
          textAlign: 'center',
          fontSize: '1.5rem',
          fontWeight: 500,
          lineHeight: 1.15,
        },
      },
      MuiTextField: {
        root: {},
      },
      MuiInputLabel: {
        root: {},
        outlined: {
          transform: 'translate(12px, 14px) scale(1)',
        },
      },
      MuiOutlinedInput: {
        input: {
          padding: 12,
        },
        notchedOutline: {
          border: '1px solid rgba(0,0,0,.3)',
        },
        root: {
          '&.Mui-focused': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#0070f3 !important',
              borderWidth: 1,
            },
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(0,0,0,.5)',
          },
        },
      },
      MuiInputBase: {
        root: {
          borderRadius: 8,
        },
      },
    },
    palette: {
      primary: {
        main: '#0070f3',
      },
      background: {
        default: '#fff',
        paper: '#eaeaea',
      },
    },
  },
  frFR
);

export default theme;
