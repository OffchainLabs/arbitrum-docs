<table>
    <tr>
        <th style={{minWidth: 180 + 'px'}}>Scenario</th> 
        <th>Solution</th>
    </tr>
    <tr>
      <td>Waiting for peers / peer disconnected / no active peers: <code>TODO</code></td>
      <td>Peers will continuously disconnect and reconnect, so don't worry about <code>Peer disconnected</code> messages. If your beacon node is struggling to find peers: <br/>
      <ul>
          <li>Your beacon node might be suffering from connectivity problems. Visit <a href='/docs/prysm-usage/p2p-host-ip'>Improve P2P connectivity</a> for connectivity troubleshooting guidance. Ensure that your firewall isn't restricting any <strong>outbound</strong> ports for Prysm.</li>
          <li>You may be using an incorrect genesis state or network flag. Every test network requires its own genesis state and network flag. Visit our <a href='../install/install-with-script'>Quickstart</a> for the latest test network parameters.</li>
      </ul>
      </td>
    </tr>
</table>
