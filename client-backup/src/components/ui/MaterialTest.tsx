import React from 'react';
import { Button } from '@material/web/button/button.js';
import { TextField } from '@material/web/textfield/lib/text-field.js';
import { Card } from '@material/web/card/card.js';

export const MaterialTest: React.FC = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Material Design Components Test</h1>
      
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Buttons</h2>
        <div className="flex flex-wrap gap-4 mb-6">
          <Button variant="filled">Filled</Button>
          <Button variant="outlined">Outlined</Button>
          <Button variant="text">Text</Button>
        </div>

        <h2 className="text-xl font-semibold mb-4 mt-8">Text Fields</h2>
        <div className="space-y-4 max-w-md">
          <TextField 
            label="Standard" 
            placeholder="Type something..."
            className="w-full"
          />
          <TextField 
            label="Outlined" 
            variant="outlined" 
            placeholder="Outlined field"
            className="w-full"
          />
          <TextField 
            label="Filled" 
            variant="filled" 
            placeholder="Filled field"
            className="w-full"
          />
        </div>

        <h2 className="text-xl font-semibold mb-4 mt-8">Card</h2>
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-2">Card Title</h3>
          <p className="text-gray-700">
            This is an example of a Material Design card component.
            Cards are a great way to group related content and actions.
          </p>
        </Card>
      </Card>


      <div className="mt-8 p-4 bg-gray-50 rounded-md">
        <h2 className="text-xl font-semibold mb-4">Usage Example</h2>
        <pre className="bg-gray-800 text-green-400 p-4 rounded-md overflow-x-auto">
          {`import { Button } from '@material/web/button/button.js';
import { TextField } from '@material/web/textfield/lib/text-field.js';

function MyComponent() {
  return (
    <div>
      <Button variant="filled">Click me</Button>
      <TextField label="Name" />
    </div>
  );
}`}
        </pre>
      </div>
    </div>
  );
};

export default MaterialTest;
