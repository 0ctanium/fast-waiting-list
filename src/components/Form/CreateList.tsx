import Input from '@components/Form/Input/Input';
import React, { useCallback, useState } from 'react';
import Button from '@components/Button/Button';
import LoadingSpinner from '@icons/Loading';

export type CreateListFormProps = {
  onSubmit?: (values: CreateListFormValues) => void;
  loading?: boolean;
};

export type CreateListFormValues = {
  name: string;
  desc: string;
};

const CreateListForm: React.FC<CreateListFormProps> = (props) => {
  const [state, setState] = useState<CreateListFormValues>({
    name: '',
    desc: '',
  });

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      props.onSubmit(state);
    },
    [props, state]
  );

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label={'Nom'}
        id={'name'}
        name={'name'}
        type={'text'}
        placeholder={'Entrez le nome de la liste'}
        onChange={handleChange}
        value={state.name}
        required
        autoComplete={'off'}
        fullWidth
        color={'#eaeaea'}
        style={{ marginBottom: '1.5rem' }}
      />
      <Input
        label={'Description'}
        id={'desc'}
        name={'desc'}
        type={'text'}
        placeholder={"Decrivez le but dans la vie qu'aura cette liste"}
        onChange={handleChange}
        value={state.desc}
        autoComplete={'off'}
        fullWidth
        color={'#eaeaea'}
      />
      <Button type={'submit'}>
        {props.loading ? <LoadingSpinner /> : 'Créer'}
      </Button>
    </form>
  );
};

export default CreateListForm;
